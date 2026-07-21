import { CreateSeguimientoModal } from "./CreateSeguimientoModal";

type Props = {
    open: boolean;
    onClose: () => void;
};

export function CreateSeguimientoTecnicoModal({ open, onClose }: Props) {
    return <CreateSeguimientoModal open={open} onClose={onClose} mode="TECNICA" />;
}