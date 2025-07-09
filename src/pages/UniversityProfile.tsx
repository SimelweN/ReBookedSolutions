import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { ALL_SOUTH_AFRICAN_UNIVERSITIES } from "@/constants/universities/index";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, MapPin, Users, Award } from "lucide-react";
import Layout from "@/components/Layout";

/**
 * University Profile Component
 * Displays detailed information about a specific university
 */
const UniversityProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const university = ALL_SOUTH_AFRICAN_UNIVERSITIES.find(
    (uni) =>
      uni.id === id || uni.name.toLowerCase().replace(/\s+/g, "-") === id,
  );

  if (!university) {
    return <Navigate to="/university-info" replace />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl md:text-3xl font-bold">
                  {university.name}
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  {university.type} University
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                {university.province}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span>{university.location}</span>
                </div>

                {university.establishedYear && (
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-muted-foreground" />
                    <span>Established: {university.establishedYear}</span>
                  </div>
                )}

                {university.studentPopulation && (
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span>
                      Students: {university.studentPopulation.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {university.website && (
                  <Button asChild variant="outline" className="w-full">
                    <a
                      href={university.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visit Website
                    </a>
                  </Button>
                )}

                <Button asChild className="w-full">
                  <a href="/university-info">View All Universities</a>
                </Button>
              </div>
            </div>

            {university.faculties && university.faculties.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Faculties</h3>
                <div className="grid gap-3">
                  {university.faculties.map((faculty, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium">{faculty.name}</h4>
                      {faculty.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {faculty.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UniversityProfile;
