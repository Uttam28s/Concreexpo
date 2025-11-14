'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { appointmentApi, clientApi, engineerApi } from '@/lib/api';
import { Appointment, Client, Engineer, PaginatedResponse, AppointmentStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Calendar as CalendarIcon,
  Loader2,
  Building2,
  User,
  MapPin,
  FileText,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  MessageSquare,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AppointmentsPage() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // OTP Dialog
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // Feedback Dialog
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    clientId: '',
    engineerId: '',
    visitDate: '',
    visitTime: '09:00', // Default time
    purpose: '',
    siteAddress: '',
    googleMapsLink: '',
    otpMobileNumber: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
    if (user?.role === 'ADMIN') {
      fetchClients();
      fetchEngineers();
    }
  }, [page, searchTerm, user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentApi.getAll({
        page,
        limit: 10,
        search: searchTerm,
      });
      const data = response.data as PaginatedResponse<Appointment>;
      setAppointments(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotalCount(data.pagination.total);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await clientApi.getAll({ limit: 1000 });
      const data = response.data as PaginatedResponse<Client>;
      setClients(data.data.filter((c) => c.isActive));
    } catch (error: any) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const fetchEngineers = async () => {
    try {
      const response = await engineerApi.getAll({ limit: 1000 });
      const data = response.data as PaginatedResponse<Engineer>;
      setEngineers(data.data.filter((e) => e.isActive));
    } catch (error: any) {
      console.error('Failed to fetch engineers:', error);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      clientId: '',
      engineerId: '',
      visitDate: '',
      visitTime: '09:00',
      purpose: '',
      siteAddress: '',
      googleMapsLink: '',
      otpMobileNumber: '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      // Combine date and time into ISO datetime string
      const visitDateTime = `${formData.visitDate}T${formData.visitTime}:00`;

      const submitData = {
        clientId: formData.clientId,
        engineerId: formData.engineerId,
        visitDate: visitDateTime,
        purpose: formData.purpose || undefined,
        siteAddress: formData.siteAddress || undefined,
        googleMapsLink: formData.googleMapsLink || undefined,
        otpMobileNumber: formData.otpMobileNumber || undefined,
      };

      await appointmentApi.create(submitData);
      toast.success('Appointment created successfully');
      setIsDialogOpen(false);
      fetchAppointments();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create appointment');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSendOtp = async (appointmentId: string) => {
    try {
      await appointmentApi.sendOtp(appointmentId);
      toast.success('OTP sent successfully');
      fetchAppointments();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send OTP');
    }
  };

  const handleOpenOtpDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setOtp('');
    setIsOtpDialogOpen(true);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    setOtpLoading(true);
    try {
      await appointmentApi.verifyOtp(selectedAppointment.id, otp);
      toast.success('OTP verified successfully');
      setIsOtpDialogOpen(false);
      setOtp('');
      fetchAppointments();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Invalid OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOpenFeedbackDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setFeedback(appointment.feedback || '');
    setIsFeedbackDialogOpen(true);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    setFeedbackLoading(true);
    try {
      await appointmentApi.submitFeedback(selectedAppointment.id, feedback);
      toast.success('Feedback submitted successfully');
      setIsFeedbackDialogOpen(false);
      setFeedback('');
      fetchAppointments();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    const statusConfig = {
      SCHEDULED: {
        className: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        icon: Clock,
        label: 'Scheduled',
      },
      OTP_SENT: {
        className: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        icon: Send,
        label: 'OTP Sent',
      },
      VERIFIED: {
        className: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        icon: CheckCircle,
        label: 'Verified',
      },
      COMPLETED: {
        className: 'bg-green-500/10 text-green-400 border-green-500/30',
        icon: CheckCircle,
        label: 'Completed',
      },
      CANCELLED: {
        className: 'bg-red-500/10 text-red-400 border-red-500/30',
        icon: XCircle,
        label: 'Cancelled',
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100">Appointments</h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Manage client site visits and verifications</p>
        </div>
        {/* Desktop Button */}
        {user?.role === 'ADMIN' && (
          <Button
            onClick={handleOpenDialog}
            className="hidden md:flex gradient-primary text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
          >
            <Plus className="mr-2 h-4 w-4" />
            Schedule Appointment
          </Button>
        )}
      </div>

      {/* Mobile Floating Action Button */}
      {user?.role === 'ADMIN' && (
        <Button
          onClick={handleOpenDialog}
          className="md:hidden fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full gradient-primary text-white shadow-lg shadow-blue-500/40 hover:shadow-blue-500/60 p-0"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Search */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search appointments by client, engineer, or site..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-10 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100">
            All Appointments ({totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-slate-600" />
              <p className="mt-4 text-slate-400">No appointments found</p>
              <p className="text-sm text-slate-500 mt-1">
                {searchTerm
                  ? 'Try adjusting your search'
                  : 'Schedule your first appointment to get started'}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-slate-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-800/50 hover:bg-slate-800/50">
                      <TableHead className="text-slate-300">Date</TableHead>
                      <TableHead className="text-slate-300">Client</TableHead>
                      <TableHead className="text-slate-300">Engineer</TableHead>
                      <TableHead className="text-slate-300">Site Address</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow
                        key={appointment.id}
                        className="border-slate-800 hover:bg-slate-800/30"
                      >
                        <TableCell>
                          <div className="flex items-center text-slate-300 text-sm">
                            <CalendarIcon className="w-4 h-4 mr-2 text-blue-400" />
                            {format(new Date(appointment.visitDate), 'MMM dd, yyyy hh:mm a')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-blue-400" />
                            </div>
                            <span className="font-medium text-slate-200">
                              {appointment.client.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                              <User className="w-4 h-4 text-purple-400" />
                            </div>
                            <span className="text-slate-300">{appointment.engineer.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {appointment.siteAddress ? (
                            <div className="flex items-start text-slate-400 text-sm max-w-xs">
                              <MapPin className="w-3 h-3 mr-1.5 mt-0.5 text-slate-500 flex-shrink-0" />
                              <span className="line-clamp-2">{appointment.siteAddress}</span>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {/* Admin Actions */}
                            {user?.role === 'ADMIN' && appointment.status === 'SCHEDULED' && (
                              <Button
                                size="sm"
                                onClick={() => handleSendOtp(appointment.id)}
                                className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30"
                              >
                                <Send className="h-3 w-3 mr-1" />
                                Send OTP
                              </Button>
                            )}

                            {/* Engineer Actions */}
                            {user?.role === 'ENGINEER' && appointment.engineerId === user.id && (
                              <>
                                {appointment.status === 'SCHEDULED' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleSendOtp(appointment.id)}
                                    className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30"
                                  >
                                    <Send className="h-3 w-3 mr-1" />
                                    Send OTP
                                  </Button>
                                )}

                                {appointment.status === 'OTP_SENT' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleOpenOtpDialog(appointment)}
                                    className="gradient-primary text-white"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Verify OTP
                                  </Button>
                                )}

                                {(appointment.status === 'VERIFIED' || appointment.status === 'COMPLETED') && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleOpenFeedbackDialog(appointment)}
                                    className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30"
                                  >
                                    <MessageSquare className="h-3 w-3 mr-1" />
                                    {appointment.feedback ? 'Edit Feedback' : 'Add Feedback'}
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-slate-400">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
            <DialogDescription className="text-slate-400">
              Create a new site visit appointment
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Client */}
            <div className="space-y-2">
              <Label htmlFor="client" className="text-slate-200">
                Client *
              </Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) =>
                  setFormData({ ...formData, clientId: value })
                }
                required
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {clients.map((client) => (
                    <SelectItem
                      key={client.id}
                      value={client.id}
                      className="text-slate-100 focus:bg-slate-700 focus:text-slate-100"
                    >
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Engineer */}
            <div className="space-y-2">
              <Label htmlFor="engineer" className="text-slate-200">
                Engineer *
              </Label>
              <Select
                value={formData.engineerId}
                onValueChange={(value) =>
                  setFormData({ ...formData, engineerId: value })
                }
                required
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue placeholder="Select engineer" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {engineers.map((engineer) => (
                    <SelectItem
                      key={engineer.id}
                      value={engineer.id}
                      className="text-slate-100 focus:bg-slate-700 focus:text-slate-100"
                    >
                      {engineer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Visit Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visitDate" className="text-slate-200">
                  Visit Date *
                </Label>
                <Input
                  id="visitDate"
                  type="date"
                  value={formData.visitDate}
                  onChange={(e) =>
                    setFormData({ ...formData, visitDate: e.target.value })
                  }
                  required
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visitTime" className="text-slate-200">
                  Visit Time *
                </Label>
                <Input
                  id="visitTime"
                  type="time"
                  value={formData.visitTime}
                  onChange={(e) =>
                    setFormData({ ...formData, visitTime: e.target.value })
                  }
                  required
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
            </div>

            {/* Site Address */}
            <div className="space-y-2">
              <Label htmlFor="siteAddress" className="text-slate-200">
                Site Address
              </Label>
              <Input
                id="siteAddress"
                value={formData.siteAddress}
                onChange={(e) =>
                  setFormData({ ...formData, siteAddress: e.target.value })
                }
                className="bg-slate-800 border-slate-700 text-slate-100"
                placeholder="123 Main Street, City"
              />
            </div>

            {/* Google Maps Link */}
            <div className="space-y-2">
              <Label htmlFor="googleMapsLink" className="text-slate-200">
                Google Maps Link (Optional)
              </Label>
              <Input
                id="googleMapsLink"
                value={formData.googleMapsLink}
                onChange={(e) =>
                  setFormData({ ...formData, googleMapsLink: e.target.value })
                }
                className="bg-slate-800 border-slate-700 text-slate-100"
                placeholder="https://maps.google.com/?q=..."
              />
              <p className="text-xs text-slate-500">
                Engineer can tap to open directions in Google Maps
              </p>
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <Label htmlFor="purpose" className="text-slate-200">
                Purpose
              </Label>
              <Input
                id="purpose"
                value={formData.purpose}
                onChange={(e) =>
                  setFormData({ ...formData, purpose: e.target.value })
                }
                className="bg-slate-800 border-slate-700 text-slate-100"
                placeholder="Site inspection, measurement, etc."
              />
            </div>

            {/* OTP Mobile Number */}
            <div className="space-y-2">
              <Label htmlFor="otpMobileNumber" className="text-slate-200">
                OTP Mobile Number (Optional)
              </Label>
              <Input
                id="otpMobileNumber"
                value={formData.otpMobileNumber}
                onChange={(e) =>
                  setFormData({ ...formData, otpMobileNumber: e.target.value })
                }
                className="bg-slate-800 border-slate-700 text-slate-100"
                placeholder="+91 98765 43210"
              />
              <p className="text-xs text-slate-500">
                If not provided, OTP will be sent to client's primary contact
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={formLoading}
                className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={formLoading}
                className="gradient-primary text-white"
              >
                {formLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Appointment'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* OTP Verification Dialog */}
      <Dialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle>Verify OTP</DialogTitle>
            <DialogDescription className="text-slate-400">
              Enter the OTP sent to the client
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleVerifyOtp} className="space-y-4 mt-4">
            {selectedAppointment && (
              <div className="p-4 bg-slate-800/50 rounded-lg space-y-2">
                <p className="text-sm text-slate-400">Client:</p>
                <p className="font-medium text-slate-200">{selectedAppointment.client.name}</p>
                <p className="text-xs text-slate-500">
                  OTP sent to: {selectedAppointment.otpMobileNumber || selectedAppointment.client.primaryContact}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="otp" className="text-slate-200">
                Enter OTP *
              </Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                className="bg-slate-800 border-slate-700 text-slate-100 text-center text-2xl tracking-widest"
                placeholder="000000"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOtpDialogOpen(false)}
                disabled={otpLoading}
                className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={otpLoading}
                className="gradient-primary text-white"
              >
                {otpLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verify OTP
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedAppointment?.feedback ? 'Edit Feedback' : 'Add Feedback'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Share your notes and observations from the site visit
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitFeedback} className="space-y-4 mt-4">
            {selectedAppointment && (
              <div className="p-4 bg-slate-800/50 rounded-lg space-y-2">
                <p className="text-sm text-slate-400">Appointment:</p>
                <p className="font-medium text-slate-200">{selectedAppointment.client.name}</p>
                <p className="text-xs text-slate-500">
                  {format(new Date(selectedAppointment.visitDate), 'MMM dd, yyyy hh:mm a')}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="feedback" className="text-slate-200">
                Feedback / Notes *
              </Label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={5}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                placeholder="Enter your observations, measurements, site condition, materials needed, etc..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFeedbackDialogOpen(false)}
                disabled={feedbackLoading}
                className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={feedbackLoading}
                className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30"
              >
                {feedbackLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
