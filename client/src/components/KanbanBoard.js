import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import API from '../api';

const STATUSES = [
  { key: 'Applied', label: 'Applied', color: '#2563eb', border: 'border-blue-500' },
  { key: 'Round 1', label: 'Round 1', color: '#7c3aed', border: 'border-violet-500' },
  { key: 'Round 2', label: 'Round 2', color: '#0ea5e9', border: 'border-sky-500' },
  { key: 'Offer', label: 'Offer', color: '#22c55e', border: 'border-emerald-500' },
  { key: 'Rejected', label: 'Rejected', color: '#ef4444', border: 'border-red-500' }
];

export default function KanbanBoard({ applications, setApplications }) {
  const buckets = STATUSES.reduce((acc, status) => {
    acc[status.key] = [];
    return acc;
  }, {});

  applications.forEach((app) => {
    const bucket = buckets[app.status] || buckets.Applied;
    bucket.push(app);
  });

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const appId = result.draggableId;
    const status = STATUSES[result.destination.droppableId].key;
    try {
      await API.put(`/api/applications/${appId}`, { status });
      setApplications(applications.map((app) => (app._id === appId ? { ...app, status } : app)));
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  return (
    <div id="applications" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-300">Application Pipeline</p>
          <h2 className="text-2xl font-bold text-white">Drag to move candidates through stages</h2>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {STATUSES.map((status, index) => (
            <Droppable droppableId={`${index}`} key={status.key}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="bg-gray-900 border border-gray-800 rounded-2xl shadow-sm transition-all duration-200 hover:border-emerald-500">
                  <div className={`px-4 py-3 rounded-t-2xl text-white font-semibold bg-gray-950 border-t-4 ${status.border}`}>
                    <div className="flex items-center justify-between">
                      <span>{status.label}</span>
                      <span className="text-sm bg-gray-800 px-2 py-1 rounded-md text-gray-300">{buckets[status.key].length}</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3 min-h-[220px]">
                    {buckets[status.key].map((item, idx) => {
                      const dateValue = item.dateApplied || item.createdAt || Date.now();
                      const statusBadgeColor = STATUSES.find((s) => s.key === item.status)?.color || '#6b7280';
                      return (
                        <Draggable draggableId={item._id} index={idx} key={item._id}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="rounded-3xl bg-gray-900 border border-gray-800 p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500 hover:bg-gray-800 hover:shadow-emerald-500/20"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="text-sm font-semibold text-white">{item.company}</div>
                                  <div className="mt-1 text-sm text-gray-400">{item.role}</div>
                                </div>
                                <span
                                  className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                                  style={{ background: statusBadgeColor }}
                                >
                                  {item.status}
                                </span>
                              </div>
                              <div className="mt-4 flex items-center justify-between gap-2 text-xs text-gray-400">
                                <span>{new Date(dateValue).toLocaleDateString()}</span>
                                <span>{item.candidateName}</span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
