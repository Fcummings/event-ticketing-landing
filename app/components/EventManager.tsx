'use client'

import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Event {
  id: string;
  name: string;
  date: string;
  image: string;
  description: string;
}

export function EventManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const { user, role } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const eventsCollection = collection(db, 'events');
    const eventSnapshot = await getDocs(eventsCollection);
    const eventList = eventSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
    setEvents(eventList);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      await updateDoc(doc(db, 'events', editingEvent.id), { name, date, image, description });
      setEditingEvent(null);
    } else {
      await addDoc(collection(db, 'events'), { name, date, image, description });
    }
    setName('');
    setDate('');
    setImage('');
    setDescription('');
    fetchEvents();
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setName(event.name);
    setDate(event.date);
    setImage(event.image);
    setDescription(event.description);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'events', id));
    fetchEvents();
  };

  if (role !== 'admin') {
    return <p>You do not have permission to access this page.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Event Manager</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <Input
          type="text"
          placeholder="Event Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <Input
          type="url"
          placeholder="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          required
        />
        <Textarea
          placeholder="Event Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <Button type="submit">{editingEvent ? 'Update Event' : 'Add Event'}</Button>
      </form>
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="border p-4 rounded">
            <h2 className="text-xl font-semibold">{event.name}</h2>
            <p>{event.date}</p>
            <p>{event.description}</p>
            <div className="mt-2 space-x-2">
              <Button onClick={() => handleEdit(event)}>Edit</Button>
              <Button variant="destructive" onClick={() => handleDelete(event.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

