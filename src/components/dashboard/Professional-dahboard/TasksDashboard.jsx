import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Card } from "@/components/ui/Card";
import StepsProgressChart from "../StepsProgressChart";
import Modal from "@/components/ui/Modal";
import CreateNewTaskModal from "./CreateNewTaskModal";
import UpdateTaskModal from "./UpdateTaskModal";
import CreateNewEventModal from "./CreateNewEventModal";
import OfficeTimeModal from "./OfficeTimeModal";
import { useTodos } from "@/hooks/useTodos";
import { useJiraTasks } from "@/hooks/useJiraTasks";
import { useToastContext } from "@/components/providers/ToastProvider";

export default function TasksDashboard() {
  const [activeModal, setActiveModal] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const { success, error: showError } = useToastContext();

  // Todos hook integration
  const {
    todos,
    loading: todosLoading,
    error: todosError,
    create: createTodo,
    update: updateTodo,
    toggleComplete,
    remove: deleteTodo,
    pendingCount,
  } = useTodos({
    fetchOnMount: true,
    queryOptions: { limit: 50, orderBy: "created_at DESC" },
  });

  // Jira Tasks hook integration
  const {
    tasks: jiraTasks,
    loading: jiraLoading,
    error: jiraError,
  } = useJiraTasks({
    fetchOnMount: true,
    queryOptions: { limit: 50, orderBy: "created_at DESC" },
  });

  // Get priority color
  const getPriorityColor = (priority) => {
    const p = priority?.toLowerCase();
    if (p === "high") return "bg-[#E25C5C]";
    if (p === "medium") return "bg-[#FF9F00]";
    if (p === "low") return "bg-[#77BF51]";
    return "bg-[#5569FE]";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleOpenModal = (task) => {
    setSelectedTask(task);
    // Check if this is a todo task or jira task
    if (task.id && todos.some((t) => t.id === task.id)) {
      // It's a todo task, open update modal
      setIsUpdateModalOpen(true);
    } else {
      // It's a jira task, open the details modal
      setActiveModal("share");
    }
  };

  const handleOpenMeetingModal = () => {
    setActiveModal("meetingModal");
  };

  const handleTaskSubmit = async (taskData) => {
    const result = await createTodo(taskData);
    if (result.success) {
      success("Task Created", "Your task has been created successfully");
      setIsModalOpen(false);
    } else {
      showError("Error", result.error || "Failed to create task");
    }
  };

  const handleTaskUpdate = async (taskData) => {
    const result = await updateTodo(selectedTask.id, taskData);
    if (result.success) {
      success("Task Updated", "Your task has been updated successfully");
      setIsUpdateModalOpen(false);
    } else {
      showError("Error", result.error || "Failed to update task");
    }
  };

  const handleTaskDelete = async (taskId) => {
    const result = await deleteTodo(taskId);
    if (result.success) {
      success("Task Deleted", "Your task has been deleted successfully");
      setIsUpdateModalOpen(false);
      setSelectedTask(null);
    } else {
      showError("Error", result.error || "Failed to delete task");
    }
  };

  const handleToggleComplete = async (e, taskId, completed) => {
    e.stopPropagation();
    const result = await toggleComplete(taskId, !completed);
    if (result.success) {
      success(
        "Task Updated",
        `Task marked as ${!completed ? "completed" : "pending"}`
      );
    } else {
      showError("Error", result.error || "Failed to update task");
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2 gap-6">
        {/* To-Do Section */}
        <StepsProgressChart
          completed={todos.filter(t => t.completed).length}
          pending={pendingCount}
          title="Tasks Progress"
        />
        <Card className="p-4 md:p-6 bg-white border-[0.5px] border-[#0000001A] !rounded-[14.01px] shadow-[0px_14px_54px_0px_#00000008] w-full hover:shadow-[0px_14px_54px_0px_#00000008] duration-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center mb-3 gap-2">
              <h3 className="text-lg font-bold text-[#4D4D4D] ">To-DO</h3>
              <span className="bg-[#561FE8] text-white text-sm font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                {pendingCount}
              </span>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-9 h-9 flex items-center justify-center bg-[#EEE9FD] hover:bg-[#5B3FFF]/20 rounded-[10px] transition"
            >
              <Icon icon="mdi:plus" className="text-[#561FE8] text-sm" />
            </button>
          </div>

          <div className="space-y-4">
            {todosLoading ? (
              <div className="flex justify-center py-8">
                <Icon
                  icon="mdi:loading"
                  className="text-[#561FE8] text-2xl animate-spin"
                />
              </div>
            ) : todosError ? (
              <div className="text-center py-8">
                <p className="text-sm text-red-500">{todosError}</p>
              </div>
            ) : todos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-[#4D4D4D99]">No tasks</p>
              </div>
            ) : (
              todos.map((task) => (
                <div
                  key={task.id}
                  className="flex  justify-between border-b border-[#F3F3F3] pb-3 last:border-none cursor-pointer"
                  onClick={() => handleOpenModal(task)}
                >
                  <div className="flex items-start gap-3 h-full">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={(e) =>
                        handleToggleComplete(e, task.id, task.completed)
                      }
                      className="w-4 h-4 mt-1 accent-[#5B3FFF] cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <p className="text-[11px] text-[#5569FE] font-normal">
                        {task.project}
                      </p>
                      <h4
                        className={`text-sm font-semibold text-[#4D4D4D] ${
                          task.completed ? "line-through opacity-60" : ""
                        }`}
                      >
                        {task.title}
                      </h4>
                      <p className="text-[11px] font-semibold text-[#4D4D4D99]">
                        Priority:{" "}
                        <span
                          className={
                            task.priority === "high"
                              ? "text-[#E25C5C]"
                              : task.priority === "medium"
                              ? "text-[#FF9811]"
                              : "text-[#34A853]"
                          }
                        >
                          {task.priority}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="flex flex-col items-end !justify-between h-full">
                      <span
                        className={`w-3 h-3 rounded-full ${getPriorityColor(
                          task.priority
                        )}`}
                      />
                      <p className="text-[10px] text-[#4D4D4D99]">
                        Due: {formatDate(task.due_date)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Jira Task Section */}
        <Card className="p-4 md:p-6 bg-white border-[0.5px] border-[#0000001A] !rounded-[14.01px] shadow-[0px_14px_54px_0px_#00000008] w-full hover:shadow-[0px_14px_54px_0px_#00000008] duration-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#4D4D4D]">Jira Tasks</h3>
              <span className="bg-[#5569FE] text-white text-sm font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                {jiraTasks.length}
              </span>
            </div>
            {/* <button
              onClick={handleOpenMeetingModal}
              className="px-4 py-2 bg-[#5569FE] hover:bg-[#4456DD] text-white text-sm font-semibold rounded-[8px] transition duration-200 flex items-center gap-2"
            >
              <Icon icon="mdi:calendar-check" className="text-base" />
              Meeting
            </button> */}
          </div>

          <div className="space-y-4">
            {jiraLoading ? (
              <div className="flex justify-center py-8">
                <Icon
                  icon="mdi:loading"
                  className="text-[#5569FE] text-2xl animate-spin"
                />
              </div>
            ) : jiraError ? (
              <div className="text-center py-8">
                <p className="text-sm text-red-500">{jiraError}</p>
              </div>
            ) : jiraTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-[#4D4D4D99]">No Jira tasks found</p>
                <p className="text-xs text-[#4D4D4D99] mt-1">
                  Connect your Jira account to see tasks
                </p>
              </div>
            ) : (
              jiraTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="border-b border-gray-100 pb-3 last:border-none"
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="text-[11px] text-[#5569FE] font-normal">
                        {task.project || task.project_key || "N/A"}
                      </p>
                      <h4 className="text-sm font-semibold text-[#4D4D4D]">
                        {task.title || task.summary || "Untitled Task"}
                      </h4>
                      <p className="text-[11px] font-semibold text-[#4D4D4D99]">
                        Priority:{" "}
                        <span
                          className={
                            task.priority?.toLowerCase() === "high"
                              ? "text-[#E25C5C]"
                              : task.priority?.toLowerCase() === "medium"
                              ? "text-[#FF9811]"
                              : "text-[#34A853]"
                          }
                        >
                          {task.priority || "N/A"}
                        </span>
                      </p>
                      {task.created_at && (
                        <p className="text-xs text-gray-400 mt-1">
                          Created: {formatDate(task.created_at)}
                        </p>
                      )}
                    </div>
                    <div className="h-full">
                      <div className="flex flex-col items-end !justify-between h-full">
                        <span className="text-xs border border-[#F6F6F6] bg-[#F6F6F6] inline-flex items-center justify-center h-6 px-3 rounded-full text-[#4D4D4D]">
                          {task.status || "Open"}
                        </span>
                        {task.due_date && (
                          <p className="text-[10px] text-[#4D4D4D99] mt-2">
                            Due: {formatDate(task.due_date)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Modal
        isOpen={activeModal === "share"}
        onClose={() => setActiveModal(null)}
        title={selectedTask?.title || "Task Details"}
        size="md"
        className={"w-[350px]"}
      >
        {selectedTask && (
          <>
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                checked={selectedTask.completed}
                onChange={(e) => {
                  e.stopPropagation();
                  handleToggleComplete(
                    e,
                    selectedTask.id,
                    selectedTask.completed
                  );
                }}
                className="w-4 h-4 accent-[#5B3FFF] cursor-pointer"
              />
              <p className="text-[11px] text-[#5569FE] font-normal">
                {selectedTask.project || selectedTask.project_key || "N/A"}
              </p>
              <span className="text-xs border border-[#5569FE] bg-[#5569FE26] inline-flex items-center justify-center h-6 px-2 rounded-full text-[#4D4D4D]">
                {selectedTask.status ||
                  (selectedTask.completed ? "Completed" : "Pending")}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#4D4D4D]">
                {selectedTask.title}
              </h4>
              <p className="text-[11px] font-semibold text-[#4D4D4D99]">
                Priority:{" "}
                <span
                  className={
                    selectedTask.priority === "high"
                      ? "text-[#E25C5C]"
                      : selectedTask.priority === "medium"
                      ? "text-[#FF9811]"
                      : "text-[#34A853]"
                  }
                >
                  {selectedTask.priority}
                </span>
              </p>
            </div>
            {selectedTask.description && (
              <p className="my-3 text-xs text-[#777777]">
                {selectedTask.description}
              </p>
            )}
            <div className="flex gap-4 text-xs text-[#4D4D4D99]">
              {selectedTask.start_date && (
                <p>Start: {formatDate(selectedTask.start_date)}</p>
              )}
              {selectedTask.due_date && (
                <p>Due: {formatDate(selectedTask.due_date)}</p>
              )}
            </div>
          </>
        )}
      </Modal>
      <Modal
        isOpen={activeModal === "meetingModal"}
        onClose={() => setActiveModal(null)}
        title={"Financial Advisor Meeting"}
        className={"!max-w-[600px]"}
      >
        {/* Top Row - Date, Location, Reminder */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
          {/* Date and Time */}
          <div className="flex gap-2 items-center relative">
            <div className="h-full w-[2px] bg-[#0000001A] absolute -right-3"></div>
            <Icon
              icon="mdi:calendar-outline"
              className="w-4 h-4 text-[#5569FE]"
            />
            <div>
              <p className="text-xs font-semibold text-[#4D4D4D]">
                Monday, August 25, 2025
              </p>
              <p className="text-[11px] text-[#8D8D8D] mt-1">
                9:00 AM – 9:30 AM
              </p>
            </div>
          </div>

          {/* Location/Room */}
          <div className="flex gap-2 items-center relative">
            <div className="h-full w-[2px] bg-[#0000001A] absolute -right-3"></div>
            <Icon
              icon="mdi:map-marker-outline"
              className="w-4 h-4 text-[#4CAF50]"
            />
            <div>
              <p className="text-xs font-semibold text-[#4D4D4D]">
                Conference Room A
              </p>
              <p className="text-[11px] text-[#5569FE] cursor-pointer hover:underline mt-1">
                Join video call
              </p>
            </div>
          </div>

          {/* Reminder */}
          <div className="flex gap-2 items-center">
            <Icon icon="mdi:bell-outline" className="w-4 h-4 text-[#FF9F00]" />
            <div>
              <p className="text-xs font-semibold text-[#4D4D4D]">Reminder</p>
              <p className="text-[11px] text-[#8D8D8D] mt-1">
                30 minutes before
              </p>
            </div>
          </div>

          {/* Organizer */}
          <div className="flex gap-2 items-center relative">
            <div className="h-full w-[2px] bg-[#0000001A] absolute -right-3"></div>
            <Icon
              icon="mdi:account-outline"
              className="w-4 h-4 text-[#4D4D4D]"
            />
            <div>
              <p className="text-[11px] text-[#8D8D8D] mb-2">Organized by</p>
              <p className="text-xs font-semibold text-[#4D4D4D]">
                Sarah Johnson
              </p>
              <p className="text-[11px] text-[#8D8D8D] mt-1">
                sarah@company.com
              </p>
            </div>
          </div>

          {/* Attendees */}
          <div className="flex gap-2 items-center relative">
            <div className="h-full w-[2px] bg-[#0000001A] absolute -right-3"></div>
            <Icon
              icon="mdi:account-multiple-outline"
              className="w-4 h-4 text-[#4D4D4D]"
            />
            <div>
              <p className="text-xs font-semibold text-[#4D4D4D]">Attendees</p>
              <p className="text-[11px] text-[#8D8D8D] mt-1">
                2 people invited
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex gap-2 items-center">
            <Icon
              icon="mdi:check-circle-outline"
              className="w-4 h-4 text-[#4CAF50]"
            />
            <div>
              <p className="text-xs font-semibold text-[#4D4D4D]">Status</p>
              <p className="text-[11px] text-[#4CAF50] font-semibold mt-1">
                Confirmed
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <p className="text-xs font-semibold text-[#4D4D4D] mb-3">Notes</p>
          <p className="text-xs text-[#8D8D8D] leading-relaxed">
            Weekly team standup to discuss progress, blockers, and upcoming
            tasks. Please come prepared with your updates.
          </p>
        </div>
      </Modal>
      <CreateNewTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleTaskSubmit}
      />
      <UpdateTaskModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={handleTaskUpdate}
        onDelete={handleTaskDelete}
        onToggleComplete={async (taskId, completed) => {
          const result = await toggleComplete(taskId, !completed);
          if (result.success) {
            success(
              "Task Updated",
              `Task marked as ${!completed ? "completed" : "pending"}`
            );
          } else {
            showError("Error", result.error || "Failed to update task");
          }
        }}
        task={selectedTask}
      />
      {/* <CreateNewEventModal
       isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleTaskSubmit} /> */}
    </>
  );
}
