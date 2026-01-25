"use client";

import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ChevronRight } from "lucide-react";

export default function SectionCard({
  icon: Icon,
  title,
  subtitle,
  onClick,
  actionLabel = "Manage",
  variant = "default",
  children,
}) {
  // If children are provided, render a detailed card
  if (children) {
    return (
      <Card>
        <Card.Body className="p-6">
          <div className="flex items-start gap-4 mb-4">
            {Icon && (
              <div className="bg-blue-100 p-3 rounded-lg">
                <Icon className="h-6 w-6 text-blue-600" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          {children}
        </Card.Body>
      </Card>
    );
  }

  // Default: render a clickable summary card
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={onClick}
    >
      <Card.Body className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="bg-blue-100 p-3 rounded-lg">
                <Icon className="h-6 w-6 text-blue-600" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-600">
              {actionLabel}
            </span>
            <ChevronRight className="h-5 w-5 text-blue-600" />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
