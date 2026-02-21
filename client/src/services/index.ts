/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/api/axiosInstance";

// -------------------- Auth Services --------------------
export async function registerService(formData) {
  try {
    const { data } = await axiosInstance.post("/auth/register", formData);
    return data;
  } catch (error: any) {
    // Return the error response in a consistent format
    return {
      success: false,
      type: error.response?.data?.type || "UNKNOWN_ERROR",
      message: error.response?.data?.message || "Une erreur est survenue",
      error: error.response?.data,
    };
  }
}
export async function loginService(formData: {
  userEmail: string;
  password: string;
  hCaptchaToken: string;
}) {
  try {
    const { data } = await axiosInstance.post("/auth/login", formData);
    return data;
  } catch (error: any) {
    return {
      success: false,
      type: error.response?.data?.type || "UNKNOWN_ERROR",
      message: error.response?.data?.message || "Échec de la connexion",
      error: error.response?.data,
    };
  }
}
export async function AddUserService(user) {
  const { data } = await axiosInstance.post("/auth/addUser", user);
  return data;
}
export async function getUserByIdService(userId) {
  const { data } = await axiosInstance.get(`/auth/get/${userId}`);
  return data;
}
export async function getUserBooking(userId) {
  const { data } = await axiosInstance.get(`/auth/bookingHistory/${userId}`);
  return data;
}
export async function checkAuthService() {
  const { data } = await axiosInstance.get("/auth/check-auth");
  return data;
}
export async function logoutService() {
  const { data } = await axiosInstance.post("/auth/logout");
  return data;
}
export async function getAllUsersService() {
  const { data } = await axiosInstance.get("/auth/getAllUsers");
  return data;
}
export async function UpdateUserService(userId, user) {
  const { data } = await axiosInstance.put(`/auth/update/${userId}`, user);
  return data;
}
export async function UpdateUserStatusService(userId, { status: status }) {
  const { data } = await axiosInstance.post(`/auth/updatStatus/${userId}`, {
    status: status,
  });
  return data;
}
export async function DeleteUserService(userId) {
  const { data } = await axiosInstance.delete(`/auth/DeleteUser/${userId}`);
  return data;
}
export async function ForgotpasswordService(userEmail) {
  const { data } = await axiosInstance.post(`/auth/forgot-password`, userEmail);
  return data;
}
export async function ResetPasswordService({ token, password }) {
  const { data } = await axiosInstance.post("/auth/reset-password", {
    token,
    password,
  });
  return data;
}

export async function updatePasswordService(
  CurrentPassword,
  NewPassword,
  userId
) {
  const { data } = await axiosInstance.put(`/auth/updatePassword/${userId}`, {
    CurrentPassword,
    NewPassword,
  });
  return data;
}

// -------------------- House Services --------------------
export async function getAllHousesService() {
  const { data } = await axiosInstance.get(`/responsible/house/getAll`);

  return data;
}
export async function UpdateHouseService(houseId, formdata) {
  console.log("updated House" ,formdata);
  const { data } = await axiosInstance.put(
    `/responsible/house/update/${houseId}`,
    formdata
  );
  return data;
}
export async function getHouseByIdService(houseId) {
  const { data } = await axiosInstance.get(
    `/responsible/house/get/details/${houseId}`
  );
  return data;
}

export async function AddHouseService(formData) {
  console.log("house", formData);
  const { data } = await axiosInstance.post("/responsible/house/add", formData);
  return data;
}

export async function DeleteHouseService(houseId) {
  const { data } = await axiosInstance.delete(
    `/responsible/house/delete/${houseId}`
  );
  return data;
}

// -------------------- Convention Services --------------------
export async function getAllConventions() {
  const { data } = await axiosInstance.get(`/responsible/convention/getAll`);
  return data;
}
export async function AddConventionService(formData) {
  const { data } = await axiosInstance.post(
    "/responsible/convention/AddConvention",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
}
export async function UpdateConventionService(conventionId, formData) {
  const { data } = await axiosInstance.put(
    `/responsible/convention/edit/${conventionId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
}

export async function DeleteConventionService(conventionId) {
  const { data } = await axiosInstance.delete(
    `/responsible/convention/delete/${conventionId}`
  );
  return data;
}

// -------------------- Hotel Services --------------------
export async function AddHotelService(formData) {
  const { data } = await axiosInstance.post(
    "/responsible/hotel/AddHotel",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
}
export async function DeleteHotelService(hotelId) {
  const { data } = await axiosInstance.delete(
    `/responsible/hotel/delete/${hotelId}`
  );
  return data;
}

export async function UpdateHotelService(hotelId, formData) {
  const { data } = await axiosInstance.put(
    `/responsible/hotel/edit/${hotelId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
}
export async function getAllHotelsService() {
  const { data } = await axiosInstance.get(`/responsible/hotel/getAllHotels`);
  return data;
}

// -------------------- Event Services --------------------
export async function getAllEvents() {
  const { data } = await axiosInstance.get(`/responsible/events/getAll`);
  return data;
}

export async function AddEventService(formData) {
  const { data } = await axiosInstance.post(
    "/responsible/events/AddEvents",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
}
export async function UpdateEventService(eventId, formData) {
  const { data } = await axiosInstance.put(
    `/responsible/events/edit/${eventId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
}

export async function DeleteEventService(eventId) {
  const { data } = await axiosInstance.delete(
    `/responsible/events/delete/${eventId}`
  );
  return data;
}

// -------------------- Booking Services --------------------
export async function getAllBookings() {
  const { data } = await axiosInstance.get(`/responsible/booking/getAll`);
  return data;
}

export async function AddBookingService(
  userId: string,
  activity: string, // Expecting activity ID as string
  activityCategory: string,
  bookingPeriod: { start: Date; end: Date } | null,
  participants?: Array<{ firstName: string; lastName: string; age: number; type?: string }>
): Promise<{ success: boolean; data?: any; error?: BookingError }> {
  try {
    const response = await axiosInstance.post("/responsible/booking/Add", {
      userId,
      activity,
      activityCategory,
      bookingPeriod: bookingPeriod
        ? {
            start: bookingPeriod.start.toISOString(),
            end: bookingPeriod.end.toISOString(),
          }
        : null,
      participants,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    // Handle Axios errors
    if (error.response) {
      // Server responded with error status
      const serverError = error.response.data;
      return {
        success: false,
        error: {
          success: false,
          message: serverError.message || "Booking request failed",
          errorType: serverError.errorType || "server_error",
          errorCode: serverError.errorCode,
          details: serverError.details,
        },
      };
    } else if (error.request) {
      // No response received
      return {
        success: false,
        error: {
          success: false,
          message: "No response from server. Please check your connection.",
          errorType: "network_error",
          errorCode: "NETWORK_001",
        },
      };
    } else {
      // Request setup error
      return {
        success: false,
        error: {
          success: false,
          message: error.message || "Failed to setup booking request",
          errorType: "client_error",
          errorCode: "CLIENT_001",
        },
      };
    }
  }
}

export async function UpdateBookingService(bookingid, formData) {
  const { data } = await axiosInstance.put(
    `/responsible/booking/edit/${bookingid}`,
    formData
  );
  return data;
}

export async function DeleteBookingService(bookingid) {
  const { data } = await axiosInstance.delete(
    `/responsible/booking/delete/${bookingid}`
  );
  return data;
}
export async function UpdateBookingStatusService(
  bookingId: string,
  status: string
) {
  console.log("Selected Status:", status);
  const { data } = await axiosInstance.put<{ status: string }>(
    `/responsible/booking/statuschange/${bookingId}`,
    { status }
  );
  return data;
}

///------------------CONTACT FORM-----------------------------

export async function ContactService(formData) {
  const { data } = await axiosInstance.post("/api/contact/send", formData);
  return data;
}


// services/DownloadConventionService.ts
export const DownloadConventionService = async (filePath: string, filename: string) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/${filePath}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Erreur lors du téléchargement du fichier");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw error;
  }
};

export interface BookingError {
  success: boolean;
  message: string;
  errorType?: string;
  errorCode?: string;
  details?: any;
}
