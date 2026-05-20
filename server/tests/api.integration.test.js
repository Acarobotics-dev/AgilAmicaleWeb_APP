const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const createApp = require("../createApp");
const {
  seedUser,
  signUserToken,
  seedHouse,
  seedEvent,
  clearCollections,
  models,
} = require("./helpers");
const Booking = models.Booking;

let mongoServer;
let app;

function withAuth(httpChain, user) {
  return httpChain.set("Authorization", `Bearer ${signUserToken(user)}`);
}

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-jwt-at-least-32-chars!!";
  process.env.SESSION_SECRET = process.env.SESSION_SECRET || "test-session-secret-32bytes-min!!";
  process.env.CLIENT_URI_1 = process.env.CLIENT_URI_1 || "http://localhost:5173";

  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();

  await mongoose.connect(process.env.MONGO_URI);
  app = createApp();
}, 90000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  await clearCollections();
});

describe("SEC11 Health", () => {
  it("returns healthy payload", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "healthy");
  });
});

describe("Security checklist (documents current behaviour)", () => {
  it("SEC1 register accepts privileged role/status from body (documents risk)", async () => {
    const payload = {
      firstName: "Tmp",
      lastName: "User",
      userEmail: "sec1@test.local",
      matricule: "8001",
      password: "Testpass1",
      role: "responsable",
      status: "Approuvé",
    };
    const res = await request(app).post("/auth/register").send(payload);
    expect(res.status).toBe(201);
    const saved = await models.User.findOne({ userEmail: "sec1@test.local" }).lean();
    expect(saved.role).toBe("responsable");
    expect(saved.status).toBe("Approuvé");
  });

  it("SEC2 adherent PUT /auth/update/:id accepts role escalation in body until allowlisted", async () => {
    const adherent = await seedUser({
      role: "adherent",
      status: "Approuvé",
      matricule: "8111",
      userEmail: "sec2a@test.local",
    });
    const token = signUserToken(adherent);

    const res = await request(app)
      .put(`/auth/update/${adherent._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        role: "responsable",
        firstName: "Up",
      });

    expect(res.status).toBe(200);
    const fresh = await models.User.findById(adherent._id).lean();
    expect(fresh.role).toBe("responsable");
  });

  it("SEC3 any authenticated user can GET /auth/get/:otherUserId (IDOR leak vector)", async () => {
    const alice = await seedUser({ status: "Approuvé", matricule: "8222", userEmail: "alice@test.local" });
    const bob = await seedUser({
      role: "adherent",
      status: "Approuvé",
      matricule: "8333",
      userEmail: "bob@test.local",
    });

    const res = await request(app)
      .get(`/auth/get/${alice._id}`)
      .set("Authorization", `Bearer ${signUserToken(bob)}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("password");
  });

  it("SEC4 addUser casing: lowercase may 404; AddUser rejects unauthenticated (401)", async () => {
    const lowercase = await request(app).post("/auth/addUser").send({});
    expect([401, 404]).toContain(lowercase.status);

    const properCase = await request(app).post("/auth/AddUser").send({});
    expect(properCase.status).toBe(401);
  });

  it("SEC5 contact endpoint allows rapid bursts without rate-limit (documents gap)", async () => {
    const bodies = [];
    for (let i = 0; i < 15; i += 1) {
      bodies.push(
        request(app)
          .post("/api/contact/send")
          .send({
            firstName: "Spam",
            lastName: "Test",
            email: `s${i}@t.local`,
            message: "Coucou",
          })
      );
    }
    const results = await Promise.all(bodies);
    const statusesOk = results.every((r) => r.status >= 200 && r.status < 300);
    const no429 = results.every((r) => r.status !== 429);
    expect(statusesOk).toBe(true);
    expect(no429).toBe(true);
  });

  it("SEC6 contact stores raw HTML in message field", async () => {
    const html = `<img src=x onerror='#'>`;
    const res = await request(app)
      .post("/api/contact/send")
      .send({
        firstName: "A",
        lastName: "B",
        email: "evil@test.local",
        message: html,
      });
    expect([200]).toContain(res.status);
    const ContactMessage = require("../models/Contact");
    const row = await ContactMessage.findOne({ email: "evil@test.local" }).lean();
    expect(row.message).toContain("<img");
  });

  it('SEC9 root GET allowed without Origin (CORS "no-origin" behaviour)', async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
  });

  it.skip("SEC7 login token storage browser-only — requires browser tests", () => {});
  it.skip("SEC8 CSRF probe — manual / browser harness", () => {});
});

describe("Booking matrix", () => {
  it("A2 pending user cannot POST /responsible/booking/Add", async () => {
    const pending = await seedUser({ status: "En Attente", matricule: "9001", userEmail: "pend@test.local" });
    const house = await seedHouse({ unavailableDates: [] });

    const res = await request(app)
      .post("/responsible/booking/Add")
      .set("Authorization", `Bearer ${signUserToken(pending)}`)
      .send({
        userId: pending._id.toString(),
        activity: house._id.toString(),
        activityCategory: "Sejour Maison",
        bookingPeriod: {
          start: new Date("2040-01-01"),
          end: new Date("2040-01-10"),
        },
      });

    expect(res.status).toBe(403);
  });

  it("H1 invalid house period start >= end => BOOKING_002", async () => {
    const approved = await seedUser({ status: "Approuvé", matricule: "9010", userEmail: "hh1@test.local" });
    const house = await seedHouse({});
    const res = await withAuth(request(app).post("/responsible/booking/Add"), approved)
      .send({
        userId: approved._id.toString(),
        activity: house._id.toString(),
        activityCategory: "Sejour Maison",
        bookingPeriod: {
          start: new Date("2040-01-10"),
          end: new Date("2040-01-09"),
        },
      });
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe("BOOKING_002");
  });

  it("H2 invalid JSON bookingPeriod string => BOOKING_001", async () => {
    const approved = await seedUser({ status: "Approuvé", matricule: "9011", userEmail: "hh2@test.local" });
    const house = await seedHouse({});
    const res = await withAuth(request(app).post("/responsible/booking/Add"), approved)
      .send({
        userId: approved._id.toString(),
        activity: house._id.toString(),
        activityCategory: "Sejour Maison",
        bookingPeriod: "not-valid-json-{",
      });
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe("BOOKING_001");
  });

  it("H3 overlapping house bookings conflict => BOOKING_003", async () => {
    const approved = await seedUser({ status: "Approuvé", matricule: "9012", userEmail: "hh3@test.local" });
    const house = await seedHouse({});
    const body = () => ({
      userId: approved._id.toString(),
      activity: house._id.toString(),
      activityCategory: "Sejour Maison",
      bookingPeriod: {
        start: new Date("2050-02-01"),
        end: new Date("2050-02-15"),
      },
    });

    const first = await withAuth(request(app).post("/responsible/booking/Add"), approved).send(body());
    expect(first.status).toBe(201);
    const second = await withAuth(request(app).post("/responsible/booking/Add"), approved).send(body());
    expect(second.status).toBe(409);
    expect(second.body.errorCode).toBe("BOOKING_003");
  });

  it("H4 blocked when house unavailableDates intersect requested range => BOOKING_017", async () => {
    const approved = await seedUser({ status: "Approuvé", matricule: "9013", userEmail: "hh4@test.local" });
    const house = await seedHouse({ unavailableDates: ["2060-05-03"] });

    const res = await withAuth(request(app).post("/responsible/booking/Add"), approved)
      .send({
        userId: approved._id.toString(),
        activity: house._id.toString(),
        activityCategory: "Sejour Maison",
        bookingPeriod: {
          start: new Date(Date.UTC(2060, 4, 1)),
          end: new Date(Date.UTC(2060, 4, 9)),
        },
      });

    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe("BOOKING_017");
  });

  it("H6 wrong activity id with Sejour Maison => BOOKING_016", async () => {
    const approved = await seedUser({ status: "Approuvé", matricule: "9015", userEmail: "hh6@test.local" });
    const evt = await seedEvent();
    const res = await withAuth(request(app).post("/responsible/booking/Add"), approved)
      .send({
        userId: approved._id.toString(),
        activity: evt._id.toString(),
        activityCategory: "Sejour Maison",
        bookingPeriod: {
          start: new Date("2070-01-01"),
          end: new Date("2070-01-10"),
        },
      });
    expect(res.status).toBe(404);
    expect(res.body.errorCode).toBe("BOOKING_016");
  });

  it("E1 duplicate Event booking blocked => BOOKING_006", async () => {
    const approved = await seedUser({ status: "Approuvé", matricule: "9100", userEmail: "ee1@test.local" });
    const evt = await seedEvent({});

    const body = () => ({
      userId: approved._id.toString(),
      activity: evt._id.toString(),
      activityCategory: "Activité",
    });

    const first = await withAuth(request(app).post("/responsible/booking/Add"), approved).send(body());
    expect(first.status).toBe(201);
    const dup = await withAuth(request(app).post("/responsible/booking/Add"), approved).send(body());
    expect(dup.status).toBe(409);
    expect(dup.body.errorCode).toBe("BOOKING_006");
  });

  it("E2 third booking sequential rejected when capacity is 2 for headcount-per-booking logic", async () => {
    const u1 = await seedUser({
      role: "adherent",
      status: "Approuvé",
      matricule: "9201",
      userEmail: "u1@test.local",
    });
    const u2 = await seedUser({
      role: "adherent",
      status: "Approuvé",
      matricule: "9202",
      userEmail: "u2@test.local",
    });
    const evt = await seedEvent({ maxParticipants: 2, currentParticipants: 0 });

    const b1 = await withAuth(request(app).post("/responsible/booking/Add"), u1)
      .send({
        userId: u1._id.toString(),
        activity: evt._id.toString(),
        activityCategory: "Activité",
      });

    expect(b1.status).toBe(201);

    const b2 = await withAuth(request(app).post("/responsible/booking/Add"), u2)
      .send({
        userId: u2._id.toString(),
        activity: evt._id.toString(),
        activityCategory: "Activité",
      });
    expect(b2.status).toBe(201);

    const u3 = await seedUser({
      role: "adherent",
      status: "Approuvé",
      matricule: "9203",
      userEmail: "u3@test.local",
    });

    const b3 = await withAuth(request(app).post("/responsible/booking/Add"), u3)
      .send({
        userId: u3._id.toString(),
        activity: evt._id.toString(),
        activityCategory: "Activité",
      });
    expect(b3.status).toBe(400);
    expect(b3.body.errorCode).toBe("BOOKING_008");
    const fresh = await models.Event.findById(evt._id).lean();
    expect(fresh.currentParticipants).toBe(2);
  });

  it("E3 concurrent last-seat bookings: at least one rejects when maxParticipants === 1", async () => {
    const evt = await seedEvent({ maxParticipants: 1, currentParticipants: 0 });
    const userA = await seedUser({
      role: "adherent",
      status: "Approuvé",
      matricule: "9301",
      userEmail: "cona@test.local",
    });
    const userB = await seedUser({
      role: "adherent",
      status: "Approuvé",
      matricule: "9302",
      userEmail: "conb@test.local",
    });

    const bodyA = () => ({
      userId: userA._id.toString(),
      activity: evt._id.toString(),
      activityCategory: "Activité",
    });
    const bodyB = () => ({
      userId: userB._id.toString(),
      activity: evt._id.toString(),
      activityCategory: "Activité",
    });

    const [rA, rB] = await Promise.all([
      withAuth(request(app).post("/responsible/booking/Add"), userA).send(bodyA()),
      withAuth(request(app).post("/responsible/booking/Add"), userB).send(bodyB()),
    ]);

    const successes = [rA.status, rB.status].filter((s) => s === 201);
    expect(successes.length).toBe(1);

    const count = await Booking.countDocuments({ activity: evt._id });
    expect(count).toBe(1);
  });

  it("E6 invalid participant names => BOOKING_015", async () => {
    const approved = await seedUser({
      role: "adherent",
      status: "Approuvé",
      matricule: "9401",
      userEmail: "ep@test.local",
    });
    const evt = await seedEvent({});

    const res = await withAuth(request(app).post("/responsible/booking/Add"), approved)
      .send({
        userId: approved._id.toString(),
        activity: evt._id.toString(),
        activityCategory: "Activité",
        participants: [{ lastName: "Kid", age: 6, type: "child" }],
      });

    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe("BOOKING_015");
  });

  it("A3 user cannot PUT /userEdit on someone else's booking", async () => {
    const owner = await seedUser({
      role: "adherent",
      status: "Approuvé",
      matricule: "9501",
      userEmail: "own@test.local",
    });
    const other = await seedUser({
      role: "adherent",
      status: "Approuvé",
      matricule: "9502",
      userEmail: "oth@test.local",
    });
    const house = await seedHouse({});

    const created = await withAuth(request(app).post("/responsible/booking/Add"), owner)
      .send({
        userId: owner._id.toString(),
        activity: house._id.toString(),
        activityCategory: "Sejour Maison",
        bookingPeriod: {
          start: new Date("2080-06-01"),
          end: new Date("2080-06-10"),
        },
      });
    expect(created.status).toBe(201);
    const id = created.body.bookingId;

    const forbidden = await withAuth(request(app).put(`/responsible/booking/userEdit/${id}`), other)
      .send({
        bookingPeriod: {
          start: new Date("2080-07-01").toISOString(),
          end: new Date("2080-07-10").toISOString(),
        },
      });
    expect(forbidden.status).toBe(403);
  });

  it("A4 user cannot edit booking after confirmation", async () => {
    const owner = await seedUser({
      role: "adherent",
      status: "Approuvé",
      matricule: "9601",
      userEmail: "own2@test.local",
    });
    const manager = await seedUser({
      role: "responsable",
      status: "Approuvé",
      matricule: "9609",
      userEmail: "mgr@test.local",
    });
    const house = await seedHouse({ unavailableDates: [] });

    const created = await withAuth(request(app).post("/responsible/booking/Add"), owner)
      .send({
        userId: owner._id.toString(),
        activity: house._id.toString(),
        activityCategory: "Sejour Maison",
        bookingPeriod: {
          start: new Date("2090-06-01"),
          end: new Date("2090-06-10"),
        },
      });
    const id = created.body.bookingId;

    const statusRes = await withAuth(
      request(app).put(`/responsible/booking/statuschange/${id}`),
      manager
    )
      .send({ status: "confirmé" });
    expect(statusRes.status).toBe(200);

    const edit = await withAuth(request(app).put(`/responsible/booking/userEdit/${id}`), owner)
      .send({
        bookingPeriod: {
          start: new Date("2091-06-01").toISOString(),
          end: new Date("2091-06-10").toISOString(),
        },
      });
    expect(edit.status).toBe(403);
  });

  it("S1 confirming house pushes unavailableDates", async () => {
    const owner = await seedUser({
      role: "adherent",
      status: "Approuvé",
      matricule: "9701",
      userEmail: "s1@test.local",
    });
    const manager = await seedUser({
      role: "responsable",
      status: "Approuvé",
      matricule: "9709",
      userEmail: "s1m@test.local",
    });

    const house = await seedHouse({ unavailableDates: [] });
    const created = await withAuth(request(app).post("/responsible/booking/Add"), owner)
      .send({
        userId: owner._id.toString(),
        activity: house._id.toString(),
        activityCategory: "Sejour Maison",
        bookingPeriod: {
          start: new Date("2105-06-05"),
          end: new Date("2105-06-09"),
        },
      });
    const snap = await withAuth(
      request(app).put(`/responsible/booking/statuschange/${created.body.bookingId}`),
      manager
    ).send({ status: "confirmé" });
    expect(snap.status).toBe(200);

    const h = await models.House.findById(house._id).lean();
    expect((h.unavailableDates || []).length).toBeGreaterThan(0);
  });

  it("D2 second delete responds 404 and event participants stays non-negative", async () => {
    const mgr = await seedUser({
      role: "responsable",
      status: "Approuvé",
      matricule: "9809",
      userEmail: "d2@test.local",
    });

    const u = await seedUser({
      role: "adherent",
      status: "Approuvé",
      matricule: "9810",
      userEmail: "d2u@test.local",
    });
    const evt = await seedEvent({ maxParticipants: 10 });

    await withAuth(request(app).post("/responsible/booking/Add"), u)
      .send({
        userId: u._id.toString(),
        activity: evt._id.toString(),
        activityCategory: "Activité",
      });

    const booking = await Booking.findOne({ userId: u._id, activityModel: "Event" });
    expect(booking).toBeTruthy();

    const firstDel = await withAuth(
      request(app).delete(`/responsible/booking/delete/${booking._id}`),
      mgr
    );
    expect(firstDel.status).toBe(200);
    const secondDel = await withAuth(
      request(app).delete(`/responsible/booking/delete/${booking._id}`),
      mgr
    );
    expect(secondDel.status).toBe(404);

    const refreshed = await models.Event.findById(evt._id).lean();
    expect(refreshed.currentParticipants).toBeGreaterThanOrEqual(0);
  });
});
