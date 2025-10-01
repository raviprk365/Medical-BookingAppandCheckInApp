'use client';

import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Stethoscope, 
  Users, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  Award,
  Heart,
  Shield,
  Star
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <div className="container py-12 px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Stethoscope className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            About Sydney Med
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your trusted healthcare partner providing comprehensive medical services 
            with a commitment to excellence, compassion, and community health.
          </p>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-xl">Expert Practitioners</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Highly qualified doctors and specialists committed to providing 
                personalized healthcare solutions for every patient.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-xl">Convenient Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Easy online booking system with flexible appointment times 
                to fit your busy schedule and healthcare needs.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Heart className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              <CardTitle className="text-xl">Comprehensive Care</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                From routine check-ups to specialized treatments, we offer 
                complete healthcare services under one roof.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Our Story */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Our Story</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-muted-foreground mb-4">
                  Founded in 2015, Sydney Med has been serving the Sydney community with 
                  exceptional healthcare services. What started as a small family practice 
                  has grown into a comprehensive medical center with multiple locations 
                  across Sydney.
                </p>
                <p className="text-muted-foreground mb-4">
                  Our mission is to provide accessible, high-quality healthcare that puts 
                  patients first. We believe in building lasting relationships with our 
                  patients and their families, ensuring continuity of care and personalized 
                  treatment plans.
                </p>
                <p className="text-muted-foreground">
                  With state-of-the-art facilities and a team of dedicated healthcare 
                  professionals, we're committed to improving the health and wellbeing 
                  of our community.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <Award className="w-8 h-8 text-blue-600" />
                  <div>
                    <h4 className="font-semibold">Award-Winning Care</h4>
                    <p className="text-sm text-muted-foreground">
                      Recognized for excellence in patient care and community service
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                  <Shield className="w-8 h-8 text-green-600" />
                  <div>
                    <h4 className="font-semibold">Trusted by Thousands</h4>
                    <p className="text-sm text-muted-foreground">
                      Over 10,000 patients trust us with their healthcare needs
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg">
                  <Star className="w-8 h-8 text-yellow-600" />
                  <div>
                    <h4 className="font-semibold">5-Star Rated</h4>
                    <p className="text-sm text-muted-foreground">
                      Consistently rated 5 stars by our patients and their families
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Our Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'General Practice',
                'Women\'s Health',
                'Travel Medicine',
                'Pediatrics',
                'Skin Checks',
                'Minor Surgery',
                'Mental Health',
                'Chronic Disease Management',
                'Diabetes Care',
                'Pathology',
                'Vaccinations',
                'Health Assessments'
              ].map((service) => (
                <Badge key={service} variant="secondary" className="p-2 justify-center">
                  {service}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Locations */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Our Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <h4 className="font-semibold">Sydney CBD Medical Centre</h4>
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">123 George Street, Sydney 2000</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">02 9555 1234</span>
                </div>
              </div>

              <div className="text-center space-y-2">
                <h4 className="font-semibold">Bondi Beach Family Practice</h4>
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">45 Campbell Parade, Bondi Beach 2026</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">02 9130 5678</span>
                </div>
              </div>

              <div className="text-center space-y-2">
                <h4 className="font-semibold">Parramatta Health Hub</h4>
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">78 Church Street, Parramatta 2150</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">02 9635 9012</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Get in Touch</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              Have questions about our services or need to schedule an appointment? 
              We're here to help!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                <span className="font-medium">1300 SYDNEY MED</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <span className="font-medium">info@sydneymed.com.au</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
