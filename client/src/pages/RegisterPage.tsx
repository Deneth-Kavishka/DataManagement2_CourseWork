import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from 'wouter';

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  fullName: z.string().min(1, "Full name is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  isFarmer: z.boolean().default(false),
  accountType: z.enum(["consumer", "farmer"]),
  farmName: z.string().optional(),
  farmDescription: z.string().optional(),
  agreeTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine(
  data => {
    if (data.accountType === "farmer") {
      return !!data.farmName && !!data.farmDescription;
    }
    return true;
  },
  {
    message: "Farm details are required for farmer accounts",
    path: ["farmName"],
  }
);

const RegisterPage: React.FC = () => {
  const { register, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [registrationError, setRegistrationError] = useState('');
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      address: "",
      city: "",
      zipCode: "",
      phone: "",
      isFarmer: false,
      accountType: "consumer",
      farmName: "",
      farmDescription: "",
      agreeTerms: false,
    },
  });
  
  // Watch the account type to show/hide farmer fields
  const accountType = form.watch("accountType");
  
  // Update isFarmer value when accountType changes
  form.watch("accountType", (value) => {
    if (value === "farmer") {
      form.setValue("isFarmer", true);
    } else {
      form.setValue("isFarmer", false);
    }
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setRegistrationError('');
      
      // Transform data to match API expectations
      const userData = {
        username: values.username,
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        address: values.address,
        city: values.city,
        zipCode: values.zipCode,
        phone: values.phone,
        isFarmer: values.accountType === "farmer",
        farmName: values.accountType === "farmer" ? values.farmName : undefined,
        farmDescription: values.accountType === "farmer" ? values.farmDescription : undefined,
      };
      
      await register(userData);
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationError('Failed to create account. Please try again.');
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-poppins text-center">Create an Account</CardTitle>
              <CardDescription className="text-center">
                Join UrbanFood to shop fresh, local produce
              </CardDescription>
            </CardHeader>
            <CardContent>
              {registrationError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                  {registrationError}
                </div>
              )}
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="accountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="consumer">Customer</SelectItem>
                            <SelectItem value="farmer">Urban Farmer / Seller</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="Your email address" 
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password"
                              placeholder="Create a password" 
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password"
                              placeholder="Confirm your password" 
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your phone number" 
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-3">
                          <FormLabel>Address (optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Street address" 
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>City (optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="City" 
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code (optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="ZIP Code" 
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {accountType === "farmer" && (
                    <div className="space-y-4 border-t border-gray-200 pt-4 mt-4">
                      <h3 className="font-medium">Farmer Details</h3>
                      
                      <FormField
                        control={form.control}
                        name="farmName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Farm Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your farm or business name" 
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="farmDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Farm Description</FormLabel>
                            <FormControl>
                              <textarea 
                                className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Tell customers about your farm and products" 
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="agreeTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary-dark mt-6"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Creating Account...
                      </div>
                    ) : 'Create Account'}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login">
                  <a className="text-primary font-medium hover:underline">
                    Sign in
                  </a>
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RegisterPage;
