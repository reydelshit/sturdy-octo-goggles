import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DataTable } from './DataTable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ColumnDef } from '@tanstack/react-table';
import {
  Activity,
  Bell,
  Calendar as CalendarIcon,
  MoreHorizontal,
  Plus,
  Search,
  Users,
} from 'lucide-react';
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';
import DefaultProfile from '@/assets/default.jpg';
import moment from 'moment';

// const patients = [
//   {
//     id: 1,
//     name: 'Alice Johnson',
//     age: 35,
//     lastVisit: '2023-06-15',
//     nextAppointment: '2023-07-01',
//     status: 'Stable',
//   },
//   {
//     id: 2,
//     name: 'Bob Smith',
//     age: 52,
//     lastVisit: '2023-06-10',
//     nextAppointment: '2023-06-25',
//     status: 'Follow-up Required',
//   },
//   {
//     id: 3,
//     name: 'Carol Williams',
//     age: 28,
//     lastVisit: '2023-06-18',
//     nextAppointment: '2023-07-05',
//     status: 'New Patient',
//   },
//   // Add more mock patient data as needed
// ];

interface PatientsType {
  patient_id: string;
  fullname: string;
  age: number;
  last_visit: string;
  next_appointment: string;
  status: string;
}

interface FormDataType {
  fullname: string;
  age: string;
  phone: string;
}

interface FormDataTypeAppointments {
  title: string;
  appointment_date: string;
}

const useCreatePatients = () => {
  return useMutation({
    mutationFn: async (data: {
      formData: FormDataType;
      status: string;
      username: string;
      password: string;
    }) => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_LINK}/patients/create`,
        {
          ...data.formData,
          status: data.status,
          username: data.username,
          password: data.password,
        },
      );
      return response.data;
    },

    onSuccess: (data) => {
      if (data.status === 'success') {
        console.log('patient added successfully', data);
        toast({
          title: 'patient added successfully',
          description: new Date().toLocaleTimeString(),
        });
      }
    },
    onError: (error) => {
      console.error('Error:', error);
      toast({
        title: 'Error adding patient',
        description: error.message || 'Something went wrong.',
      });
    },
  });
};

const useFetchPatient = () => {
  return useQuery<PatientsType[]>({
    queryKey: ['patientsData'],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/patients`,
      );
      console.log('response', response.data);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

const useFetchPatientAppointment = () => {
  return useQuery<FormDataTypeAppointments[]>({
    queryKey: ['patientAppointments'],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/appointments`,
      );

      console.log(response.data);
      return response.data;
    },
  });
};

const useCreateAppointments = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      formData: FormDataTypeAppointments;
      patient_id: string;
    }) => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_LINK}/appointments/create`,
        {
          ...data.formData,
          patient_id: data.patient_id,
        },
      );
      return response.data;
    },

    onSuccess: (data) => {
      if (data.status === 'success') {
        console.log('Appointments added successfully', data);
        toast({
          title: 'Appointments added successfully',
          description: new Date().toLocaleTimeString(),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['patientsData'] });
    },
    onError: (error) => {
      console.error('Error:', error);
      toast({
        title: 'Error adding Appointments',
        description: error.message || 'Something went wrong.',
      });
    },
  });
};

const columns: ColumnDef<PatientsType>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={`https://avatar.vercel.sh/${row.original.patient_id}.png`}
              alt={row.original.fullname}
            />
            <AvatarFallback>
              {row.original.fullname
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <span className="ml-2">{row.original.fullname}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'age',
    header: 'Age',
    cell: ({ row }) => {
      return row.original.age || 'N/A';
    },
  },
  {
    accessorKey: 'last_visit',
    header: 'Last Visit',
    cell: ({ row }) => {
      const lastVisit = row.original.last_visit;
      const formattedDate = moment(lastVisit);

      return formattedDate.isValid() ? formattedDate.format('ll') : 'N/A';
    },
  },
  {
    accessorKey: 'next_appointment',
    header: 'Next Appointment',
    cell: ({ row }) => {
      const nextAppointment = row.original.next_appointment;
      const formattedDate = moment(nextAppointment);

      return formattedDate.isValid() ? formattedDate.format('ll') : 'N/A';
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const [formData, setFormData] = useState({
        title: '',
        appointment_date: '',
      });
      const [isDialogOpen, setIsDialogOpen] = useState(false);

      const createMutation = useCreateAppointments();

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
          ...prevState,
          [name]: value,
        }));
      };

      const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        console.log(
          'Form data',
          formData,
          'Patient ID',
          row.original.patient_id,
        );

        createMutation.mutate({
          formData,
          patient_id: row.original.patient_id,
        });

        setFormData({
          title: '',
          appointment_date: '',
        });
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(
                  row.original.patient_id.toString(),
                )
              }
            >
              Copy patient ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Update status</DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setIsDialogOpen(true);
              }}
            >
              Set Appointments
            </DropdownMenuItem>
          </DropdownMenuContent>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set Patients Appointments</DialogTitle>
                <DialogDescription>
                  Set the next appointment for the patient
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  onChange={handleInputChange}
                  value={formData.title}
                  type="text"
                  className="w-full rounded-md border p-2"
                  required
                />

                <Label htmlFor="date">Appointment Date</Label>
                <Input
                  id="date"
                  name="appointment_date"
                  onChange={handleInputChange}
                  value={formData.appointment_date}
                  type="datetime-local"
                  className="w-full rounded-md border p-2"
                  required
                />

                <Button type="submit" className="mt-4">
                  Save
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </DropdownMenu>
      );
    },
  },
];

// Mock data for health trends
const healthTrends = [
  { name: 'Jan', avgBP: 120, avgWeight: 70 },
  { name: 'Feb', avgBP: 118, avgWeight: 69 },
  { name: 'Mar', avgBP: 122, avgWeight: 71 },
  { name: 'Apr', avgBP: 119, avgWeight: 70 },
  { name: 'May', avgBP: 121, avgWeight: 72 },
  { name: 'Jun', avgBP: 120, avgWeight: 71 },
];

export default function StaffDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState({
    fullname: '',
    age: '',
    phone: '',
  });

  const createMutation = useCreatePatients();
  const { data: patients } = useFetchPatient();
  const { data: appointments } = useFetchPatientAppointment();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const generatePasswordRandom = () => {
    const length = 8;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let retVal = '';
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }

    const generatedPassword = retVal;
    const generatedUsername =
      formData.fullname.split(' ').join('') + retVal.slice(0, 3);

    return { generatedPassword, generatedUsername };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { generatedPassword, generatedUsername } = generatePasswordRandom();

    console.log({
      formData,
      status: 'New Patient',
      username: generatedUsername,
      password: generatedPassword,
    });

    createMutation.mutate({
      formData,
      status: 'New Patient',
      username: generatedUsername,
      password: generatedPassword,
    });

    setFormData({
      fullname: '',
      age: '',
      phone: '',
    });
  };

  const handleLogout = () => {
    window.location.href = '/login';
  };

  const todayAppointments =
    appointments?.filter((appointment) =>
      moment(appointment.appointment_date).isSame(moment(), 'day'),
    ) || [];

  return (
    <TooltipProvider>
      <div className="container mx-auto space-y-8 p-6">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Staff Dashboard</h1>
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
                  <AvatarImage src={DefaultProfile} alt="staff" />
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Patients
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{patients?.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Total number of patients in the system
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total number of patients in the system</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Appointments Today
                  </CardTitle>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {todayAppointments.length > 0 ? (
                      todayAppointments.length
                    ) : (
                      <div>0</div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total number of appointments scheduled for today
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Number of scheduled appointments for today</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Visit Duration
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">32m</div>
                  <p className="text-xs text-muted-foreground">
                    -2m from last week
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Average duration of patient visits</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Patient Satisfaction
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">98%</div>
                  <p className="text-xs text-muted-foreground">
                    +2% from last month
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Overall patient satisfaction rate</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Card className="col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Patient List</CardTitle>
                <CardDescription>
                  Manage and view patient information
                </CardDescription>
              </div>

              <div className="flex gap-4">
                <Dialog>
                  <DialogTrigger>
                    <Button variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Patient
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Patient</DialogTitle>
                      <DialogDescription>
                        Enter the details of the new patient here. Click save
                        when you're done.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-2"
                      >
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input
                            required
                            name="fullname"
                            onChange={handleInputChange}
                            value={formData.fullname}
                            id="fullname"
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="age" className="text-right">
                            Age
                          </Label>
                          <Input
                            required
                            id="age"
                            name="age"
                            onChange={handleInputChange}
                            value={formData.age}
                            className="col-span-3"
                          />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="phone" className="text-right">
                            Phone
                          </Label>
                          <Input
                            required
                            id="phone"
                            name="phone"
                            onChange={handleInputChange}
                            value={formData.phone}
                            className="col-span-3"
                          />
                        </div>
                        <Button className="self-end" type="submit">
                          Save Patient
                        </Button>
                      </form>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="secondary">
                  <Activity className="mr-2 h-4 w-4" />
                  Generate Reports
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search patients..." className="w-[20rem]" />
            </div>

            <DataTable columns={columns} data={patients || []} />
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Health Trends</CardTitle>
              <CardDescription>
                Average blood pressure and weight over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={healthTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="avgBP"
                    stroke="#8884d8"
                    name="Avg. Blood Pressure"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgWeight"
                    stroke="#82ca9d"
                    name="Avg. Weight"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appointment Calendar</CardTitle>
              <CardDescription>
                View and manage upcoming appointments
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
