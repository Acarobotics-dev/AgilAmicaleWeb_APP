import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContactService } from "@/services";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ContactService(formData);
      toast.success("Message envoyé avec succès !");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        message: "",
      });
    } catch (error) {
      toast.error("Erreur lors de l'envoi du message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-white via-white to-gray-50/20 pt-32 pb-16 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,0,0.05),transparent_50%)]"></div>

        <div className="relative w-full max-w-screen-xl mx-auto px-6 xl:px-0 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full text-yellow-800 text-sm font-medium mb-6">
            <MailIcon className="w-4 h-4 mr-2" />
            Contactez-nous
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800 bg-clip-text text-transparent">
            Discutez avec notre équipe
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
            Nous serions ravis de vous entendre. Veuillez remplir ce formulaire
            ou nous contacter directement par e-mail ou téléphone.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white py-16 lg:py-24">
        <div className="w-full max-w-screen-xl mx-auto px-6 xl:px-0">
          <div className="grid lg:grid-cols-2 gap-16 xl:gap-20">
            {/* Contact Information Cards */}
            <div className="space-y-8">
              <div className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Plusieurs façons de nous contacter
                </h2>
                <p className="text-gray-500 text-lg">
                  Choisissez la méthode qui vous convient le mieux pour nous joindre.
                </p>
              </div>

              <div className="grid gap-6">
                {/* Email Card */}
                <div className="group relative bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="h-14 w-14 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-500 text-white rounded-xl shadow-lg mb-6">
                      <MailIcon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Envoyez-nous un e-mail
                    </h3>
                    <p className="text-gray-500 mb-4 leading-relaxed">
                      Notre équipe est là pour vous aider et répond généralement sous 24h.
                    </p>
                    <a
                      href="mailto:gestion@amicaleagil.org"
                      className="inline-flex items-center font-semibold text-yellow-600 hover:text-yellow-700 transition-colors group"
                    >
                      gestion@amicaleagil.org
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Address Card */}
                <div className="group relative bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="h-14 w-14 flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-xl shadow-lg mb-6">
                      <MapPinIcon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Visitez notre siège
                    </h3>
                    <p className="text-gray-500 mb-4 leading-relaxed">
                      Venez nous dire bonjour à notre bureau principal à Tunis.
                    </p>
                    <address className="not-italic font-semibold text-blue-600 leading-relaxed">
                      BP 762 Ave Mohamed Ali Akid<br />
                      Tunis 1003, Tunisie
                    </address>
                  </div>
                </div>

                {/* Phone Card */}
                <div className="group relative bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="h-14 w-14 flex items-center justify-center bg-gradient-to-br from-green-400 to-green-500 text-white rounded-xl shadow-lg mb-6">
                      <PhoneIcon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Appelez-nous directement
                    </h3>
                    <p className="text-gray-500 mb-4 leading-relaxed">
                      Du lundi au vendredi de 8h à 17h, heure locale.
                    </p>
                    <div
                      className="inline-flex items-center font-semibold text-green-600 hover:text-green-700 transition-colors group"
                    >
                      71 707 222
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="relative">
              <div className="sticky top-8">
                <Card className="bg-white border-0 shadow-2xl shadow-foreground/10 rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100/20 via-white to-gray-100/20"></div>
                  <CardContent className="relative p-8 lg:p-12">
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Envoyez-nous un message
                      </h3>
                      <p className="text-gray-500">
                        Remplissez le formulaire ci-dessous et nous vous répondrons rapidement.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-sm font-semibold text-gray-900/90">
                            Prénom *
                          </Label>
                          <Input
                            placeholder="Votre prénom"
                            id="firstName"
                            className="h-12 bg-gray-100 border-gray-200 rounded-xl focus:bg-white focus:border-yellow-400 focus:ring-yellow-400/20 transition-all duration-200"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-sm font-semibold text-gray-900/90">
                            Nom *
                          </Label>
                          <Input
                            placeholder="Votre nom"
                            id="lastName"
                            className="h-12 bg-gray-100 border-gray-200 rounded-xl focus:bg-white focus:border-yellow-400 focus:ring-yellow-400/20 transition-all duration-200"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-900/90">
                          Adresse e-mail *
                        </Label>
                        <Input
                          type="email"
                          placeholder="votre.email@exemple.com"
                          id="email"
                          className="h-12 bg-gray-100 border-gray-200 rounded-xl focus:bg-white focus:border-yellow-400 focus:ring-yellow-400/20 transition-all duration-200"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-sm font-semibold text-gray-900/90">
                          Message *
                        </Label>
                        <Textarea
                          id="message"
                          placeholder="Décrivez votre demande ou question en détail..."
                          className="bg-gray-100 border-gray-200 rounded-xl focus:bg-white focus:border-yellow-400 focus:ring-yellow-400/20 transition-all duration-200 resize-none"
                          rows={6}
                          value={formData.message}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <Button
                        className="w-full h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                        size="lg"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Envoi en cours...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <MailIcon className="w-5 h-5 mr-2" />
                            Envoyer le message
                          </div>
                        )}
                      </Button>

                      <p className="text-xs text-gray-500 text-center">
                        * Champs obligatoires. Nous respectons votre vie privée.
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContactPage;
