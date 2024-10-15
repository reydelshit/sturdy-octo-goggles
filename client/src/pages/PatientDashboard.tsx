import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format, isAfter, isSameDay, parseISO } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  Activity,
  Bell,
  Calendar as CalendarIcon,
  MessageSquare,
  Pill,
} from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

import DefaultProfile from '@/assets/default.jpg';

// Mock data (same as before)
const healthTrends = [
  { date: '2023-01-01', weight: 70, bloodPressure: 120, bloodSugar: 100 },
  { date: '2023-02-01', weight: 69, bloodPressure: 118, bloodSugar: 98 },
  { date: '2023-03-01', weight: 68, bloodPressure: 122, bloodSugar: 102 },
  { date: '2023-04-01', weight: 69, bloodPressure: 119, bloodSugar: 99 },
  { date: '2023-05-01', weight: 70, bloodPressure: 121, bloodSugar: 101 },
  { date: '2023-06-01', weight: 71, bloodPressure: 120, bloodSugar: 100 },
];

const forumPosts = [
  {
    id: 1,
    title: 'Tips for managing diabetes',
    author: 'DiabetesFighter',
    replies: 15,
  },
  {
    id: 2,
    title: 'New study on heart health',
    author: 'HealthyHeart',
    replies: 8,
  },
  {
    id: 3,
    title: 'Experiences with new blood pressure medication',
    author: 'BPWarrior',
    replies: 22,
  },
  {
    id: 4,
    title: 'Healthy recipes for weight loss',
    author: 'FitFoodie',
    replies: 31,
  },
];

interface FormDataTypeAppointments {
  title: string;
  appointment_date: string;
  patient_id: string;
}

interface MedicineData {
  medicine_id: string;
  medicine_name: string;
  time: string;
  size: string;
  status: string;
  patient_id: string;
}

interface FormDataTypeMedicine {
  medicine_name: string;
  time: string;
  size: string;
  patient_id: string;
}

interface BMIData {
  bmi_id: string;
  bmi: string;
  patient_id: string;
  created_at: string;
}

interface FormDataTypeBMI {
  height: string;
  weight: string;
}

const useFetchPatientAppointment = (id: string) => {
  return useQuery<FormDataTypeAppointments[]>({
    queryKey: ['patientAppointments', id],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/appointments/${id}`,
      );

      console.log(response.data);
      return response.data;
    },
  });
};

const useFetchMedicine = (id: string) => {
  return useQuery<MedicineData[]>({
    queryKey: ['medicineData', id],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/medicine/${id}`,
      );

      console.log(response.data);
      return response.data;
    },
  });
};

const useUpdateMedicine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await axios.put(
        `${import.meta.env.VITE_API_LINK}/medicine/update/${id}`,
        { status },
      );
      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicineData'] });
    },
    onError: (error) => {
      console.error('Error updating medicine:', error);
    },
  });
};

const useCreateMedicine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      formDataMedicine: FormDataTypeMedicine;
      patient_id: string;
      status: string;
    }) => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_LINK}/medicine/create`,
        {
          ...data.formDataMedicine,
          patient_id: data.patient_id,
          status: data.status,
        },
      );
      return response.data;
    },

    onSuccess: (data) => {
      if (data.status === 'success') {
        console.log('Medicine added successfully', data);
        toast({
          title: 'Medicine added successfully',
          description: new Date().toLocaleTimeString(),
        });
      }

      queryClient.invalidateQueries({ queryKey: ['medicineData'] });
    },
    onError: (error) => {
      console.error('Error:', error);
      toast({
        title: 'Error adding Medicine',
        description: error.message || 'Something went wrong.',
      });
    },
  });
};

const useFetchBMI = (id: string) => {
  return useQuery<BMIData[]>({
    queryKey: ['bmiData', id],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/bmi/${id}`,
      );

      console.log(response.data);
      return response.data;
    },
  });
};

const useCreateBMI = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      formDataBMI: FormDataTypeBMI;
      patient_id: string;
      bmi: string;
    }) => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_LINK}/bmi/create`,
        {
          ...data.formDataBMI,
          patient_id: data.patient_id,
          bmi: data.bmi,
        },
      );
      return response.data;
    },

    onSuccess: (data) => {
      if (data.status === 'success') {
        console.log('BMI added successfully', data);
        toast({
          title: 'BMI added successfully',
          description: new Date().toLocaleTimeString(),
        });
      }

      queryClient.invalidateQueries({ queryKey: ['bmiData'] });
    },
    onError: (error) => {
      console.error('Error:', error);
      toast({
        title: 'Error adding BMI',
        description: error.message || 'Something went wrong.',
      });
    },
  });
};

export default function PatientDashboard() {
  const [formDataMedicine, setFormDataMedicine] = useState(
    {} as FormDataTypeMedicine,
  );
  const [formDataBMI, setFormDataBMI] = useState({} as FormDataTypeBMI);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const patient_id = localStorage.getItem('patient_id') || '';

  const { data: patientAppointments } = useFetchPatientAppointment(patient_id);
  const { data: patientMedicine = [] } = useFetchMedicine(patient_id);
  const { data: patientBMI = [] } = useFetchBMI(patient_id);

  const handleLogout = () => {
    window.location.href = '/login';
    localStorage.removeItem('patient_id');
    localStorage.removeItem('health_monitoring_role');
  };

  const getNextAppointment = (
    patientAppointments: FormDataTypeAppointments[] | undefined,
  ) => {
    if (!patientAppointments || patientAppointments.length === 0) {
      return 'No appointment';
    }

    const now = new Date();

    const sortedAppointments = patientAppointments.sort(
      (a, b) =>
        parseISO(a.appointment_date).getTime() -
        parseISO(b.appointment_date).getTime(),
    );

    const nextAppointment = sortedAppointments.find((appointment) => {
      const appointmentDate = parseISO(appointment.appointment_date);
      return isAfter(appointmentDate, now) || isSameDay(appointmentDate, now);
    });

    if (nextAppointment) {
      const appointmentDate = parseISO(nextAppointment.appointment_date);
      const formattedDate = format(appointmentDate, 'MMM d, yyyy h:mm a');
      return [formattedDate, nextAppointment.title];
    } else {
      return 'No upcoming appointments';
    }
  };

  const resultAppointment = getNextAppointment(patientAppointments);
  const updateMutation = useUpdateMedicine();
  const createMutation = useCreateMedicine();
  const createBMIMutation = useCreateBMI();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormDataMedicine((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) {
      return 'Underweight';
    } else if (bmi >= 18.5 && bmi <= 24.9) {
      return 'Normal weight';
    } else if (bmi >= 25 && bmi <= 29.9) {
      return 'Overweight';
    } else if (bmi >= 30 && bmi <= 34.9) {
      return 'Obesity (Class 1 - Moderate)';
    } else if (bmi >= 35 && bmi <= 39.9) {
      return 'Obesity (Class 2 - Severe)';
    } else if (bmi >= 40) {
      return 'Obesity (Class 3 - Very severe or morbid)';
    } else {
      return 'Invalid BMI';
    }
  };

  const calculateBMI = ({
    weightKg,
    heightM,
  }: {
    weightKg: number;
    heightM: number;
  }) => {
    if (weightKg <= 0 || heightM <= 0) {
      throw new Error('Weight and height must be greater than zero.');
    }

    const bmi = weightKg / (heightM * heightM);
    const withCategory = getBMICategory(Number(bmi.toFixed(2)));
    return [bmi.toFixed(2), ` (${withCategory})`];
  };

  const handleChangeBMI = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormDataBMI((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    createMutation.mutate({
      formDataMedicine,
      status: 'not taken',
      patient_id: patient_id,
    });

    setFormDataMedicine({
      medicine_name: '',
      time: '',
      size: '',
      patient_id: '',
    });
  };

  const handleUpdateMedicine = async (status: string, medicine_id: string) => {
    console.log('Updating medicine:', status, medicine_id);

    updateMutation.mutate({
      status,
      id: medicine_id,
    });
  };

  const handleSubmitBMI = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const bmi = calculateBMI({
      weightKg: Number(formDataBMI.weight),
      heightM: Number(formDataBMI.height),
    });

    createBMIMutation.mutate({
      formDataBMI,
      patient_id,
      bmi: bmi[0],
    });

    setFormDataBMI({
      height: '',
      weight: '',
    });
  };

  const handleSubmitBMIUpdate =
    (bmi_id: string) => async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const bmi = calculateBMI({
        weightKg: Number(formDataBMI.weight),
        heightM: Number(formDataBMI.height),
      });

      const response = await axios.put(
        `${import.meta.env.VITE_API_LINK}/bmi/update/${bmi_id}`,
        { bmi: bmi[0] },
      );

      if (response.data.status === 'success') {
        toast({
          title: 'BMI updated successfully',
          description: new Date().toLocaleTimeString(),
        });
      }
      console.log(response.data);

      setFormDataBMI({
        height: '',
        weight: '',
      });
    };

  return (
    <TooltipProvider>
      <div className="container mx-auto space-y-8 p-6">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Patient Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger>
                {' '}
                <Avatar className="cursor-pointer object-cover">
                  <AvatarImage src={DefaultProfile} alt="Patients" />
                  <AvatarFallback>ST</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Next Appointment
                  </CardTitle>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {!patientAppointments || patientAppointments.length === 0 ? (
                    <div className="text-2xl font-bold">No appointment</div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {resultAppointment[0]}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {resultAppointment[1]}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Your upcoming medical appointment</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Medication Adherence
                  </CardTitle>
                  <Pill className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">85%</div>
                  <Progress value={85} className="mt-2" />
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Your medication adherence rate</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">BMI</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {patientBMI.length > 0 ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">
                          {patientBMI[0].bmi}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {getBMICategory(Number(patientBMI[0].bmi))}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          Last recorded on{' '}
                          {moment(patientBMI[0].created_at).format(
                            'MMM d, yyyy',
                          )}
                        </div>
                      </div>

                      <Dialog>
                        <DialogTrigger>
                          <Button variant={'secondary'}>
                            {patientBMI.length > 0 ? 'Update BMI' : 'Add BMI'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Add a new medication to your schedule
                            </DialogTitle>
                            <DialogDescription>
                              Enter the details for your new medication
                            </DialogDescription>
                          </DialogHeader>

                          <form
                            onSubmit={handleSubmitBMIUpdate(
                              patientBMI[0].bmi_id,
                            )}
                          >
                            <Label htmlFor="height">
                              Height in meters (eg. 1.75)
                            </Label>
                            <Input
                              id="height"
                              name="height"
                              value={formDataBMI.height}
                              onChange={handleChangeBMI}
                              type="number"
                              className="w-full rounded-md border p-2"
                              required
                            />

                            <Label htmlFor="weight">
                              Weight in kg (eg. 70)
                            </Label>
                            <Input
                              id="weight"
                              name="weight"
                              value={formDataBMI.weight}
                              onChange={handleChangeBMI}
                              type="number"
                              className="w-full rounded-md border p-2"
                              required
                            />
                            {formDataBMI.height && formDataBMI.weight && (
                              <p>
                                Your current BMI is{' '}
                                {calculateBMI({
                                  weightKg: Number(formDataBMI.weight),
                                  heightM: Number(formDataBMI.height),
                                })}
                              </p>
                            )}

                            <Button type="submit" className="mt-4">
                              Save
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <div>
                        <div className="text-2xl font-bold">N/A</div>
                        <p className="text-xs text-muted-foreground">
                          No BMI records found
                        </p>
                      </div>

                      <Dialog>
                        <DialogTrigger>
                          <Button variant={'secondary'}>
                            {patientBMI.length > 0 ? 'Update BMI' : 'Add BMI'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Add a new medication to your schedule
                            </DialogTitle>
                            <DialogDescription>
                              Enter the details for your new medication
                            </DialogDescription>
                          </DialogHeader>

                          <form onSubmit={handleSubmitBMI}>
                            <Label htmlFor="height">
                              Height in meters (eg. 1.75)
                            </Label>
                            <Input
                              id="height"
                              name="height"
                              value={formDataBMI.height}
                              onChange={handleChangeBMI}
                              type="number"
                              className="w-full rounded-md border p-2"
                              required
                            />

                            <Label htmlFor="weight">
                              Weight in kg (eg. 70)
                            </Label>
                            <Input
                              id="weight"
                              name="weight"
                              value={formDataBMI.weight}
                              onChange={handleChangeBMI}
                              type="number"
                              className="w-full rounded-md border p-2"
                              required
                            />
                            {formDataBMI.height && formDataBMI.weight && (
                              <p>
                                Your current BMI is{' '}
                                {calculateBMI({
                                  weightKg: Number(formDataBMI.weight),
                                  heightM: Number(formDataBMI.height),
                                })}
                              </p>
                            )}

                            <Button type="submit" className="mt-4">
                              Save
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Your current Body Mass Index</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Forum Activity
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    New replies to your posts
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Recent activity in the community forum</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Health Trends</CardTitle>
              <CardDescription>Your health metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={healthTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="weight"
                    stroke="#8884d8"
                    name="Weight (kg)"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="bloodPressure"
                    stroke="#82ca9d"
                    name="Blood Pressure (systolic)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="bloodSugar"
                    stroke="#ffc658"
                    name="Blood Sugar (mg/dL)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>Medication Timeline</CardTitle>
                  <CardDescription>Today's medication schedule</CardDescription>
                </div>

                <Dialog>
                  <DialogTrigger>
                    <Button variant={'secondary'}>Add Medication</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Add a new medication to your schedule
                      </DialogTitle>
                      <DialogDescription>
                        Enter the details for your new medication
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                      <Label htmlFor="medicine_name">Medicine title</Label>
                      <Input
                        id="medicine_name"
                        name="medicine_name"
                        value={formDataMedicine.medicine_name}
                        onChange={handleInputChange}
                        type="text"
                        className="w-full rounded-md border p-2"
                        required
                      />

                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        name="time"
                        value={formDataMedicine.time}
                        onChange={handleInputChange}
                        type="time"
                        className="w-full rounded-md border p-2"
                        required
                      />

                      <Label htmlFor="dosage">Dosage</Label>
                      <Input
                        id="size"
                        name="size"
                        value={formDataMedicine.size}
                        onChange={handleInputChange}
                        type="text"
                        className="w-full rounded-md border p-2"
                        required
                      />

                      <Button type="submit" className="mt-4">
                        Save
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {patientMedicine.length === 0 ? (
                    <div>No added medication</div>
                  ) : (
                    patientMedicine.map((med, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{med.medicine_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {moment(med.time, 'HH:mm').format('LT')}- {med.size}
                          </p>
                        </div>
                        <div>
                          <Badge
                            variant={
                              med.status === 'Taken' ? 'default' : 'secondary'
                            }
                          >
                            {med.status}
                          </Badge>

                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Button variant="ghost" size="icon">
                                <Bell className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateMedicine('Taken', med.medicine_id)
                                }
                              >
                                Mark as taken
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateMedicine(
                                    'Missed',
                                    med.medicine_id,
                                  )
                                }
                              >
                                Mark as missed
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Calendar</CardTitle>
              <CardDescription>
                View and manage your appointments
              </CardDescription>
            </CardHeader>
            <CardContent className="flex w-full items-center justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="block rounded-md border"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Community Forum</CardTitle>
              <CardDescription>Recent discussions and posts</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {forumPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{post.title}</p>
                        <p className="text-sm text-muted-foreground">
                          By {post.author}
                        </p>
                      </div>
                      <Badge variant="secondary">{post.replies} replies</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
