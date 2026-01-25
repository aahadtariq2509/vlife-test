import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import SingleSelect from '@/components/ui/SingleSelect';
import { useState } from 'react';


const priorityOptions = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const CreateNewTaskModal = ({ isOpen, onClose, onSubmit }) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [project, setProject] = useState('');
  const [priority, setPriority] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    // Validate required fields
    if (!taskTitle || !project || !priority || !startDate || !dueDate || !description) {
      alert('Please fill in all required fields');
      return;
    }

    // Format dates to ISO strings
    const formattedStartDate = new Date(startDate).toISOString();
    const formattedDueDate = new Date(dueDate).toISOString();

    onSubmit({
      title: taskTitle,
      project,
      priority: priority?.value,
      start_date: formattedStartDate,
      due_date: formattedDueDate,
      description,
      completed: false,
    });

    // Reset form
    setTaskTitle('');
    setProject('');
    setPriority(null);
    setStartDate('');
    setDueDate('');
    setDescription('');
  };

  const getButtonClass = (option) => {
    const isActive = priority?.value === option.value;

    if (option.value === 'high') {
      return isActive
        ? 'bg-[#E25C5C] text-white border-[#E25C5C] !border'
        : 'bg-white text-[#E25C5C]  border-[#E25C5C] !border';
    }
    if (option.value === 'medium') {
      return isActive
        ? 'bg-[#FF9811] text-white border-[#FF9811] !border'
        : 'bg-white text-[#FF9811]  border-[#FF9811] !border';
    }
    if (option.value === 'low') {
      return isActive
        ? 'bg-[#34A853] text-white border-[#34A853] !border'
        : 'bg-white text-[#34A853] border-[#34A853] !border';
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Task"
      className="!max-w-[600px]"
    >
      <div className="space-y-1">
        {/* Task Title */}
        <div className='grid sm:grid-cols-2 gap-3'>
          <Input
            label="Task Title"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Enter task title"
          />

          {/* Project */}
          <Input
            label="Project"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            placeholder="Enter project name"
          />
        </div>
        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-[#4D4D4D] mb-2">
            Priority *
          </label>
          <div className="flex gap-2 justify-between">
            {priorityOptions.map((option) => (
              <div key={option.value} className={`rounded-full transition-all ${getButtonClass(option)}`}>
                <button
                  type="button"
                  onClick={() => setPriority(option)}
                  className={`px-5 py-3 rounded-full text-xs font-normal transition-all ${getButtonClass(option)}`}
                >
                  {option.label}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Start & Due Date Row */}
        <div className="grid grid-cols-2 gap-6">
          <Input
            type="date"
            label="Start Date *"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full block"
          />
          <Input
            type="date"
            label="Due Date *"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full block"
          />
        </div>

      </div>

      {/* Description */}
      <div>
        <Input
          type="textarea"
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Type Here...."
          className="h-[72px] !rounded-[20px]"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button onClick={handleSubmit}
          width="w-fit"
          backgroundColor={'#5569FE'}
          className={'px-10 py-2 text-base font-semibold'}>
          Create Task
        </Button>
      </div>
    </Modal>
  );
};

export default CreateNewTaskModal;