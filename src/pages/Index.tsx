
import { DashboardLayout } from "@/components/DashboardLayout";
import { TaskList } from "@/components/TaskList";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { QuickNotes } from "@/components/QuickNotes";
import { SummaryStats } from "@/components/SummaryStats";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome Back!</h1>
        <p className="text-gray-500">
          Here's an overview of your productivity today.
        </p>
      </div>

      <section className="mb-8">
        <SummaryStats />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <section>
          <TaskList />
        </section>
        <section>
          <PomodoroTimer />
        </section>
      </div>

      <section>
        <QuickNotes />
      </section>
    </DashboardLayout>
  );
};

export default Index;
