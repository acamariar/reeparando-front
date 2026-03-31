// src/components/project/BudgetPhotoModal.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Modal } from "../UI/Modal";
import type { Project } from "../../types/project";

type FormValues = { file: FileList };

type Props = {
    open: boolean;
    onClose: () => void;
    projectId: string;
    initialUrl?: string;
    updateProject: (id: string, payload: Partial<Project>) => Promise<Project>
    cloudName: string;        // p.ej. import.meta.env.VITE_CLOUDINARY_CLOUD
    uploadPreset: string;     // preset unsigned
};

const schema = yup.object({
    file: yup
        .mixed<FileList>()
        .test("required", "Selecciona una imagen", (files) => files && files.length > 0)
        .test("image", "Debe ser una imagen", (files) =>
            files && files.length > 0 ? files[0].type.startsWith("image/") : false
        ),
});

export default function BudgetPhotoModal({
    open,
    onClose,
    projectId,
    initialUrl,
    updateProject,
    cloudName,
    uploadPreset,
}: Props) {
    const [preview, setPreview] = useState<string | undefined>(initialUrl);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: yupResolver(schema),
    });

    const uploadToCloudinary = async (file: File) => {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", uploadPreset);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
            method: "POST",
            body: fd,
        });
        if (!res.ok) throw new Error("Error subiendo imagen");
        const json = await res.json();
        return json.secure_url as string;
    };

    const onSubmit = handleSubmit(async ({ file }) => {
        setError(null);
        setIsUploading(true);
        try {
            const f = file[0];
            const url = await uploadToCloudinary(f);
            await updateProject(projectId, { budgetphoto: url });
            setPreview(url);
            onClose();
            reset();
        } catch (e: any) {
            setError(e.message ?? "No se pudo subir");
        } finally {
            setIsUploading(false);
        }
    });

    if (!open) return null;

    return (
        <Modal open={open} onClose={onClose} title="Subir presupuesto / foto">
            <form className="space-y-4" onSubmit={onSubmit}>
                <div className="space-y-2">
                    <label className="text-sm text-slate-700 block">
                        Imagen
                        <input
                            type="file"
                            accept="image/*"
                            {...register("file")}
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100"
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) setPreview(URL.createObjectURL(f));
                            }}
                        />
                    </label>
                    {errors.file && <p className="text-xs text-red-600">{errors.file.message}</p>}
                </div>

                {preview && (
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <img src={preview} alt="Preview" className="w-full object-cover max-h-72" />
                    </div>
                )}

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        className="px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-700"
                        onClick={() => { reset(); onClose(); }}
                        disabled={isUploading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-3 py-2 text-sm rounded-lg bg-primary text-white disabled:opacity-60"
                        disabled={isUploading}
                    >
                        {isUploading ? "Subiendo..." : "Guardar"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
