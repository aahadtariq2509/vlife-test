import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Flame,
  GripVertical,
  Trash2,
} from "lucide-react";

// Icon map
const iconMap = {
  "Progress Bar": <Activity className="text-white" size={20} />,
  "Bar Chart": <BarChart3 className="text-white" size={20} />,
  "Pie Chart": <PieChart className="text-white" size={20} />,
  "Line Chart": <LineChart className="text-white" size={20} />,
  Heatmap: <Flame className="text-white" size={20} />,
};

export const WidgetList = ({ widgets, onDragEnd, onDeleteClick }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="widgets">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {widgets.map((widget, index) => (
              <Draggable
                key={widget.id}
                draggableId={widget.id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="bg-[#F9FAFB] border border-gray-200 rounded-xl mb-4 p-4 shadow-sm hover:shadow-md transition relative cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-center gap-3 justify-between">
                      <div
                        {...provided.dragHandleProps}
                        className="cursor-grab text-[#00000099]"
                      >
                        <GripVertical size={18} />
                      </div>
                      <div className="flex items-center flex-1 gap-3">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-[#3B84E3]">
                          {iconMap[widget.type] || (
                            <Activity size={20} className="text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-base sm:text-[17px] font-medium truncate">
                            {widget.title}
                          </h3>
                          <p className="text-[#4D4D4DCC] text-sm font-medium">
                            {widget.code || widget.type}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteClick(widget.id)}
                        className="text-red-600 transition pointer-events-auto"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="bg-[#F3F3F3] mt-4 rounded-full w-full p-3 text-sm text-gray-600">
                      Position: #{widget.position}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
