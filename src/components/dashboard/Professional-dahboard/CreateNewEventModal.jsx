import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import SingleSelect from '@/components/ui/SingleSelect';
import { useState } from 'react';

const calendarOptions = [
    { value: 'work', label: 'Google Calendar - Work' },
    { value: 'personal', label: 'Google Calendar - Personal' },
    { value: 'team', label: 'Google Calendar - Team' },
];

const reminderOptions = [
    { value: '15min', label: '15 Minutes before' },
    { value: '30min', label: '30 Minutes before' },
    { value: '1hour', label: '1 Hour before' },
    { value: '1day', label: '1 Day before' },
];

const CreateNewEventModal = ({ isOpen, onClose, onSubmit }) => {
    const [eventTitle, setEventTitle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('10:00');
    const [location, setLocation] = useState('');
    const [attendees, setAttendees] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = () => {
        // Validate required fields
        if (!eventTitle || !startDate || !startTime || !endDate || !endTime || !location || !attendees || !description) {
            alert('Please fill in all required fields');
            return;
        }

        // Combine date and time to create ISO strings
        const startDateTime = new Date(`${startDate}T${startTime}:00`).toISOString();
        const endDateTime = new Date(`${endDate}T${endTime}:00`).toISOString();

        // Convert attendees string to array
        const attendeesArray = attendees
            .split(',')
            .map(email => email.trim())
            .filter(email => email.length > 0);

        if (attendeesArray.length === 0) {
            alert('Please add at least one attendee email');
            return;
        }

        onSubmit({
            title: eventTitle,
            description,
            start_date: startDateTime,
            end_date: endDateTime,
            location,
            attendees: attendeesArray,
        });

        // Reset form
        setEventTitle('');
        setStartDate('');
        setStartTime('09:00');
        setEndDate('');
        setEndTime('10:00');
        setLocation('');
        setAttendees('');
        setDescription('');
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create New Event"
            className="!max-w-[600px]"
        >
            <div className="space-y-4">
                {/* Event Title */}
                <Input
                    label="Event Title *"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="Enter event title"
                />

                {/* Start Date & Time Row */}
                <div className="grid sm:grid-cols-2 gap-3">
                    <Input
                        type="date"
                        label="Start Date *"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />

                    <Input
                        type="time"
                        label="Start Time *"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    />
                </div>

                {/* End Date & Time Row */}
                <div className="grid sm:grid-cols-2 gap-3">
                    <Input
                        type="date"
                        label="End Date *"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />

                    <Input
                        type="time"
                        label="End Time *"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                    />
                </div>

                {/* Location */}
                <Input
                    label="Location *"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter location (e.g., Conference Room A)"
                />

                {/* Attendees */}
                <Input
                    label="Attendees *"
                    value={attendees}
                    onChange={(e) => setAttendees(e.target.value)}
                    placeholder="Enter email addresses separated by commas"
                />

                {/* Description */}
                <Input
                    type="textarea"
                    label="Description *"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter event description"
                    className="h-[72px] !rounded-[20px]"
                />

                {/* Submit Button */}
                <div className="flex justify-end pt-2">
                    <Button
                        onClick={handleSubmit}
                        width="w-fit"
                        backgroundColor={'#5569FE'}
                        className={'px-10 py-2 text-base font-semibold'}
                    >
                        Create Event
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default CreateNewEventModal;