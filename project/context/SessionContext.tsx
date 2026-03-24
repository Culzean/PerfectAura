import React, { createContext, useCallback, useContext, useState } from 'react';
import type { Consultation, PhotoAsset } from '../types';

interface SessionContextType {
  userName: string;
  setUserName: (name: string) => void;
  currentPhotos: PhotoAsset[];
  setCurrentPhotos: (photos: PhotoAsset[]) => void;
  referencePhotos: PhotoAsset[];
  setReferencePhotos: (photos: PhotoAsset[]) => void;
  notes: string;
  setNotes: (notes: string) => void;
  consultations: Consultation[];
  addConsultation: (consultation: Consultation) => void;
  deleteConsultation: (id: string) => void;
  resetInput: () => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState('');
  const [currentPhotos, setCurrentPhotos] = useState<PhotoAsset[]>([]);
  const [referencePhotos, setReferencePhotos] = useState<PhotoAsset[]>([]);
  const [notes, setNotes] = useState('');
  const [consultations, setConsultations] = useState<Consultation[]>([]);

  const addConsultation = useCallback((consultation: Consultation) => {
    setConsultations((prev) => [consultation, ...prev]);
  }, []);

  const deleteConsultation = useCallback((id: string) => {
    setConsultations((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const resetInput = useCallback(() => {
    setCurrentPhotos([]);
    setReferencePhotos([]);
    setNotes('');
  }, []);

  return (
    <SessionContext.Provider
      value={{
        userName,
        setUserName,
        currentPhotos,
        setCurrentPhotos,
        referencePhotos,
        setReferencePhotos,
        notes,
        setNotes,
        consultations,
        addConsultation,
        deleteConsultation,
        resetInput,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
