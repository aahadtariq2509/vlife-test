'use client';
import React, { useState, useRef, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { Icon } from '@iconify/react';

export default function BudgetGoalsCard({
    budgetGoals,
    handleDeleteBudget,
    handleUpdateBudget,
    onAddClick,
}) {
    const itemsPerPage = 8;
    const [itemOffset, setItemOffset] = useState(0);
    const [editingTitles, setEditingTitles] = useState({});
    const debounceTimers = useRef({});

    const endOffset = itemOffset + itemsPerPage;
    const currentItems = budgetGoals.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(budgetGoals.length / itemsPerPage);

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % budgetGoals.length;
        setItemOffset(newOffset);
    };

    // Debounced name update handler (1 second delay)
    const handleTitleChange = (item, newTitle) => {
        // Update local state immediately for responsive UI
        setEditingTitles(prev => ({ ...prev, [item.id]: newTitle }));

        // Clear existing timer for this item
        if (debounceTimers.current[item.id]) {
            clearTimeout(debounceTimers.current[item.id]);
        }

        // Set new timer to trigger API call after 1 second of inactivity
        debounceTimers.current[item.id] = setTimeout(() => {
            handleUpdateBudget(item, item.budget, newTitle);
            delete debounceTimers.current[item.id];
        }, 1000);
    };

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
        };
    }, []);

    // Sync editing titles with budget goals when they change (after successful save)
    useEffect(() => {
        setEditingTitles(prev => {
            const updated = { ...prev };
            let changed = false;

            budgetGoals.forEach(goal => {
                if (prev[goal.id] !== undefined && prev[goal.id] !== goal.title) {
                    // Budget was updated from parent, clear local editing state
                    delete updated[goal.id];
                    changed = true;
                }
            });

            return changed ? updated : prev;
        });
    }, [budgetGoals]);

    return (
        <div className="p-6 bg-white border border-[#0000001A] rounded-[14px] shadow-[0px_14px_54px_0px_#00000008]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#4D4D4D]">Budget Goals</h3>
                <Button
                    onClick={onAddClick}
                    icon={<Plus className="w-5 h-5" />}
                    width="w-auto"
                    fullWidth={false}
                    size="md"
                    backgroundColor={'#9747FF'}
                >
                    Add Budget
                </Button>
            </div>

            {/* Table */}
            {budgetGoals.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                    No budget goals added yet.
                </p>
            ) : (
                <>
                    <div className="overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-[#9747FF] text-white py-[13.5px] grid grid-cols-3 text-center rounded-t-md">
                                    <TableHead className='text-center'>Title</TableHead>
                                    <TableHead className='text-center'>Budget</TableHead>
                                    <TableHead className="text-center">Action</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {currentItems.map((item) => (
                                    <TableRow className='grid grid-cols-3' key={item.id}>
                                        <TableCell className="font-medium !text-center">
                                            <input
                                                type="text"
                                                value={editingTitles[item.id] ?? item.title}
                                                onChange={(e) => handleTitleChange(item, e.target.value)}
                                                className="w-full px-2 py-1 text-center text-[#4D4D4D] text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Budget category name"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center !text-center gap-2">
                                                <span>$</span>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={item.budget}
                                                        onChange={(e) =>
                                                            handleUpdateBudget(item, parseInt(e.target.value) || 0)
                                                        }
                                                        className="w-24 px-2 py-1 text-[#4D4D4D] text-sm placeholder:text-[#4D4D4D] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500
                                                      [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />

                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateBudget(item, item.budget + 1)}
                                                            className="text-gray-400 hover:text-gray-600"
                                                            style={{ fontSize: '10px' }}
                                                        >
                                                            ▲
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleUpdateBudget(item, Math.max(0, item.budget - 1))
                                                            }
                                                            className="text-gray-400 hover:text-gray-600"
                                                            style={{ fontSize: '10px' }}
                                                        >
                                                            ▼
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <button
                                                onClick={() => handleDeleteBudget(item)}
                                                className="text-red-600 hover:text-red-700 font-medium"
                                            >
                                                Delete
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* React Paginate */}
                    {pageCount > 1 && (
                        <div className="flex justify-center mt-6">
                            <ReactPaginate
                                breakLabel="..."
                                nextLabel={
                                    <Icon icon="mdi:chevron-right" className="text-[#9747FF] w-5 h-5" />
                                }
                                onPageChange={handlePageClick}
                                pageRangeDisplayed={3}
                                marginPagesDisplayed={1}
                                pageCount={pageCount}
                                previousLabel={
                                    <Icon icon="mdi:chevron-left" className="text-[#9747FF] w-5 h-5" />
                                }
                                containerClassName="flex items-center gap-2"
                                pageClassName="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-[#e5e7eb] hover:text-[#9747FF] text-gray-700 transition"
                                activeClassName="!bg-[#e5e7eb] !text-[#9747FF] border border-[#9747FF]"
                                previousClassName="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-full"
                                nextClassName="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-full hover:bg-gray-100"
                                disabledClassName="opacity-50 cursor-not-allowed"
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
