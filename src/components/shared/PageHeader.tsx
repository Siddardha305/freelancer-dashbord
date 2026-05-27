interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-8 py-4 sm:py-6 lg:px-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-3 flex-wrap">
          {action}
        </div>
      )}
    </header>
  );
}



