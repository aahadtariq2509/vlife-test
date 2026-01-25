import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useState } from 'react';
import { Clock } from 'lucide-react';

const OfficeTimeModal = ({ isOpen, onClose, onSubmit }) => {
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('06:00');

    const handleSubmit = () => {
        onSubmit({
            startTime,
            endTime,
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Office Time"
            className="!max-w-[500px]"
        >
            <div className="space-y-4">
                {/* Start Time */}
                <div className="relative">
                         <Input
                            type="time"
                            label="Start Date"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                        />
                           <Input
                            type="time"
                            label="Time End"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                        />
                 </div>
                <div className="pt-4">
                    <Button
                        onClick={handleSubmit}
                        width="w-full"
                        backgroundColor={'#5569FE'}
                        className={'py-3 text-lg font-semibold rounded-full'}
                    >
                        Save
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default OfficeTimeModal;