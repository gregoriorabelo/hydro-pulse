type MetricCardProps = {
  titulo: string;
  valor: string | number;
};

export default function MetricCard({ titulo, valor }: MetricCardProps) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
      <p className="text-slate-400">{titulo}</p>

      <h3 className="mt-5 text-5xl font-black text-white">
        {valor}
      </h3>
    </div>
  );
}