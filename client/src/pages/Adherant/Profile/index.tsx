import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PersonalInfoForm from "./PersonalInfoForm";
import DeleteAccountSection from "./DeleteAccountForm";
import Footer from "@/components/footer";
import NavbarSection from "@/components/navbar/navbar";

const Profile = () => {
  const navigate = useNavigate();

  return (
    <>
      <NavbarSection />

      <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 p-6 pt-24">
        <div className="max-w-5xl mx-auto px-4 space-y-8">
          {/* Enhanced Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
              <div className="flex items-center space-x-4 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate("/")}
                  className="h-10 w-10 border-gray-200 hover:bg-gray-100"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                    Profil utilisateur
                  </h1>
                  <p className="text-gray-500 mt-1 text-sm md:text-base">
                    Gérez vos informations personnelles et paramètres de compte
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-7 w-7 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Improved Tabs */}
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="flex gap-2 w-full max-w-md bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
              <TabsTrigger
                value="personal"
                className="flex-1 flex items-center gap-2 rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all"
              >
                <User className="h-4 w-4" />
                Informations personnelles
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="flex-1 flex items-center gap-2 rounded-md data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive transition-all"
              >
                <Shield className="h-4 w-4" />
                Sécurité
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <Card className="shadow-md border border-gray-200 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-gray-200">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <User className="h-5 w-5" />
                    Informations personnelles
                  </CardTitle>
                  <CardDescription>
                    Modifiez vos informations personnelles et préférences de
                    profil
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <PersonalInfoForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card className="shadow-md border border-gray-200 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-destructive/5 to-destructive/10 border-b border-gray-200">
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Shield className="h-5 w-5" />
                    Zone de danger
                  </CardTitle>
                  <CardDescription>
                    Actions irréversibles concernant votre compte
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-destructive mt-0.5" />
                      <p className="text-sm text-destructive">
                        Attention: Cette action est irréversible et supprimera
                        définitivement votre compte ainsi que toutes les données
                        associées.
                      </p>
                    </div>
                  </div>
                  <DeleteAccountSection />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
