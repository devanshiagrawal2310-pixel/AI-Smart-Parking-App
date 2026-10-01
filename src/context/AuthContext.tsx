import React, { createContext, useContext, useState } from 'react';
import { UserProfile, Booking } from '../types/parking';
import { DEMO_USER, MOCK_BOOKINGS } from '../data/mockData';

export interface CreateBookingParams {
  spotId: string;
  spotName: string;
  address: string;
  rate: number;
  hours: number;
  preferredSlotNumber?: string;
  floor?: string;
  slotType?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  paymentStatus?: 'PAID' | 'PENDING' | 'REFUNDED';
  paymentMethod?: 'UPI' | 'CARD' | 'WALLET';
  paymentTransactionId?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  bookings: Booking[];
  walletBalance: number;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    name: string,
    email: string,
    vehiclePlate: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  createBooking: (
    spotIdOrParams: string | CreateBookingParams,
    spotName?: string,
    address?: string,
    rate?: number,
    hours?: number,
    preferredSlotNumber?: string
  ) => Booking;
  cancelBooking: (bookingId: string) => void;
  markBookingAsPaid: (
    bookingId: string,
    paymentMethod: 'UPI' | 'CARD' | 'WALLET',
    transactionId?: string
  ) => Booking | undefined;
  deductWalletBalance: (amount: number) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(DEMO_USER);
  const [walletBalance, setWalletBalance] = useState<number>(500.0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Basic validation
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    // Demo authentication: accepts any valid format, defaults to DEMO_USER or custom email
    const loggedUser: UserProfile = {
      ...DEMO_USER,
      email: email.trim(),
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
    };

    setUser(loggedUser);
    setIsAuthenticated(true);
    return { success: true };
  };

  const signup = async (
    name: string,
    email: string,
    vehiclePlate: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!name || name.trim().length < 2) {
      return { success: false, error: 'Please enter your full name.' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!vehiclePlate || vehiclePlate.trim().length < 3) {
      return { success: false, error: 'Please enter a valid vehicle license plate.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: '+91 98230 45678',
      vehiclePlate: vehiclePlate.trim().toUpperCase(),
      vehicleModel: 'Tata Nexon EV (Demo)',
      isAiAutoReserveEnabled: true,
      preferredSpotType: 'Standard Covered',
    };

    setUser(newUser);
    setIsAuthenticated(true);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const createBooking = (
    spotIdOrParams: string | CreateBookingParams,
    argSpotName?: string,
    argAddress?: string,
    argRate?: number,
    argHours?: number,
    argPreferredSlotNumber?: string
  ): Booking => {
    let spotId = '';
    let spotName = '';
    let address = '';
    let rate = 40.0;
    let hours = 2;
    let preferredSlotNumber: string | undefined;
    let floor: string | undefined;
    let slotType: string | undefined;
    let dateStr = 'Today';
    let startStr = 'Now';
    let endStr = 'In 2 hours';

    let paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED' = 'PENDING';
    let paymentMethod: 'UPI' | 'CARD' | 'WALLET' | undefined;
    let paymentTransactionId: string | undefined;

    if (typeof spotIdOrParams === 'object') {
      spotId = spotIdOrParams.spotId;
      spotName = spotIdOrParams.spotName;
      address = spotIdOrParams.address;
      rate = spotIdOrParams.rate;
      hours = spotIdOrParams.hours;
      preferredSlotNumber = spotIdOrParams.preferredSlotNumber;
      floor = spotIdOrParams.floor;
      slotType = spotIdOrParams.slotType;
      dateStr = spotIdOrParams.date || 'Today';
      startStr = spotIdOrParams.startTime || 'Now';
      endStr = spotIdOrParams.endTime || `In ${hours} hour${hours > 1 ? 's' : ''}`;
      paymentStatus = spotIdOrParams.paymentStatus || 'PENDING';
      paymentMethod = spotIdOrParams.paymentMethod;
      paymentTransactionId = spotIdOrParams.paymentTransactionId;
    } else {
      spotId = spotIdOrParams;
      spotName = argSpotName || 'Smart Parking Facility';
      address = argAddress || 'FC Road Smart Garage, Pune';
      rate = argRate || 40.0;
      hours = argHours || 2;
      preferredSlotNumber = argPreferredSlotNumber;
      endStr = `In ${hours} hour${hours > 1 ? 's' : ''}`;
      paymentStatus = 'PAID';
      paymentMethod = 'UPI';
      paymentTransactionId = `UPI-DEMO-${Date.now().toString().slice(-6)}`;
    }

    const assignedSlot =
      preferredSlotNumber ||
      `${String.fromCharCode(65 + Math.floor(Math.random() * 4))}-${Math.floor(Math.random() * 40) + 1}`;

    const newBooking: Booking = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      spotId,
      spotName,
      locationAddress: address,
      slotNumber: assignedSlot,
      floor: floor || 'Level 1 (Ground)',
      slotType: slotType || 'STANDARD',
      vehiclePlate: user?.vehiclePlate || 'MH-12-PQ-9021',
      vehicleModel: user?.vehicleModel || 'Tata Nexon EV',
      date: dateStr,
      startTime: startStr,
      endTime: endStr,
      durationHours: hours,
      totalCost: parseFloat((rate * hours).toFixed(2)),
      status: 'ACTIVE',
      qrAccessCode: `SP-QR-${Math.floor(10000 + Math.random() * 90000)}-RESERVED`,
      pinCode: `${Math.floor(1000 + Math.random() * 9000)}`,
      paymentStatus,
      paymentMethod,
      paymentTransactionId,
      paidAt: paymentStatus === 'PAID' ? 'Just now' : undefined,
    };

    // Ensure the shared local/demo booking storage stays in sync
    if (!MOCK_BOOKINGS.some((b) => b.id === newBooking.id)) {
      MOCK_BOOKINGS.unshift(newBooking);
    }

    setBookings((prev) => {
      if (prev.some((b) => b.id === newBooking.id)) {
        return prev;
      }
      return [newBooking, ...prev];
    });

    return newBooking;
  };

  const markBookingAsPaid = (
    bookingId: string,
    method: 'UPI' | 'CARD' | 'WALLET',
    transactionId?: string
  ): Booking | undefined => {
    let updated: Booking | undefined;
    const txId = transactionId || `${method}-DEMO-${Math.floor(100000 + Math.random() * 900000)}`;

    const target = MOCK_BOOKINGS.find((b) => b.id === bookingId);
    if (target) {
      target.status = 'ACTIVE';
      target.paymentStatus = 'PAID';
      target.paymentMethod = method;
      target.paymentTransactionId = txId;
      target.paidAt = 'Just now';
    }

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          updated = {
            ...b,
            status: 'ACTIVE',
            paymentStatus: 'PAID',
            paymentMethod: method,
            paymentTransactionId: txId,
            paidAt: 'Just now',
          };
          return updated;
        }
        return b;
      })
    );
    return updated;
  };

  const deductWalletBalance = (amount: number): boolean => {
    if (walletBalance >= amount) {
      setWalletBalance((prev) => parseFloat((prev - amount).toFixed(2)));
      return true;
    }
    return false;
  };

  const cancelBooking = (bookingId: string) => {
    const target = MOCK_BOOKINGS.find((b) => b.id === bookingId);
    if (target) {
      target.status = 'CANCELLED';
    }

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' as const } : b))
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        bookings,
        walletBalance,
        login,
        signup,
        logout,
        createBooking,
        cancelBooking,
        markBookingAsPaid,
        deductWalletBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
