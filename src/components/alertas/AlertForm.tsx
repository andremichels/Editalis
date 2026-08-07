import { FormField } from '@/components/ui/FormField';

export interface AlertFormState {
  name: string;
  keywords: string;
  organs: string;
  ufs: string;
  modalities: string;
  value_min: string;
  value_max: string;
}

interface AlertFormProps {
  form: AlertFormState;
  onChange: (form: AlertFormState) => void;
  isEditing: boolean;
  editingName?: string;
  onSubmit: () => void;
  onCancel: () => void;
}

export function AlertForm({ form, onChange, isEditing, editingName, onSubmit, onCancel }: AlertFormProps) {
  const set = (field: keyof AlertFormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...form, [field]: e.target.value });

  return (
    <div
      className="mb-8 p-6"
      style={{ border: `2px solid ${isEditing ? 'var(--color-accent)' : 'var(--color-text)'}`, background: 'var(--color-neutral-100)' }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-black" style={{ fontFamily: 'var(--font-heading)' }}>
          {isEditing ? `Editando: ${editingName}` : 'Novo perfil de alerta'}
        </h3>
        {isEditing && (
          <button onClick={onCancel} className="text-xs font-bold cursor-pointer" style={{ color: 'var(--color-neutral-700)' }}>
            Cancelar edição
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="sm:col-span-2">
          <FormField label="Nome" value={form.name} onChange={set('name')} placeholder="Ex: Obras em SP" />
        </div>
        <FormField label="Órgãos (vírgula)" value={form.organs} onChange={set('organs')} placeholder="Ministério da Defesa" />
        <FormField label="Modalidades (vírgula)" value={form.modalities} onChange={set('modalities')} placeholder="pregao, concorrencia" />
        <FormField label="Palavras-chave (vírgula)" value={form.keywords} onChange={set('keywords')} placeholder="obras, reforma" />
        <FormField label="UFs (vírgula)" value={form.ufs} onChange={set('ufs')} placeholder="SP, MG, RJ" />
        <FormField label="Valor mínimo (R$)" type="number" value={form.value_min} onChange={set('value_min')} />
        <FormField label="Valor máximo (R$)" type="number" value={form.value_max} onChange={set('value_max')} />
      </div>

      <button
        onClick={onSubmit}
        className="text-left py-3 px-5 text-sm font-bold cursor-pointer"
        style={{ background: 'var(--color-accent)', border: '2px solid var(--color-accent)', color: '#fff' }}
      >
        {isEditing ? 'Salvar alterações' : 'Criar alerta'}
      </button>
    </div>
  );
}
