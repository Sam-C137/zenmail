import React from "react";
import { type DropzoneState, useDropzone } from "react-dropzone";
import { type } from "arktype";
import { MimeTypes } from "@/lib/constants";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { X, FileIcon } from "lucide-react";
import Image from "next/image";
import { motion } from "motion/react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { formatSize } from "@/lib/utils";
import { useLocalImage } from "@/hooks/use-local-image";

interface AttachmentState {
    dropzone: DropzoneState;
    onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
    onRemoveFile: (fileName: string) => void;
    files: File[];
}

const AttachmentContext = React.createContext<AttachmentState | undefined>(
    undefined,
);

export function AttachmentContextProvider({
    children,
}: React.PropsWithChildren) {
    const [files, setFiles] = React.useState<File[]>([]);
    const onDrop = React.useCallback((droppedFiles: File[]) => {
        setFiles((files) => [...files, ...droppedFiles]);
    }, []);
    const dropzone = useDropzone({
        noClick: true,
        noKeyboard: true,
        multiple: true,
        onDrop,
    });

    const onPaste = React.useCallback(
        (e: React.ClipboardEvent<HTMLInputElement>) => {
            const fPasted = Array.from(e.clipboardData.items)
                .filter((item) => item.kind === "file")
                .map((item) => item.getAsFile());

            setFiles((files) =>
                files.concat(type.instanceOf(File).array().assert(fPasted)),
            );
        },
        [],
    );

    const onRemoveFile = React.useCallback(
        (fileName: string) => {
            if (!dropzone.inputRef.current) return;
            const dt = new DataTransfer();
            const files = Array.from(dropzone.inputRef.current.files ?? []);

            for (const file of files) {
                if (file.name !== fileName) {
                    dt.items.add(file);
                }
            }

            dropzone.inputRef.current.files = dt.files;
            setFiles(Array.from(dt.files));
        },
        [dropzone.inputRef],
    );

    return (
        <AttachmentContext.Provider
            value={{
                dropzone,
                onPaste,
                onRemoveFile,
                files,
            }}
        >
            {children}
        </AttachmentContext.Provider>
    );
}

export function useAttachment() {
    const ctx = React.useContext(AttachmentContext);
    if (!ctx) {
        throw new Error(
            "useAttachment must be used within Attachment context provider",
        );
    }

    return ctx;
}

export function AttachmentBar() {
    const { files } = useAttachment();
    if (files.length < 1) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border-b"
        >
            <ScrollArea className="w-full">
                <div className="flex items-center gap-3 p-3 w-max">
                    {files.map((file, idx) => (
                        <AttachmentItem key={idx} attachment={file} />
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </motion.div>
    );
}

interface AttachmentItemProps {
    attachment: File;
}

const AttachmentItem = React.memo(({ attachment }: AttachmentItemProps) => {
    const { onRemoveFile } = useAttachment();
    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
    const isImage = attachment.type.startsWith("image");
    const url = URL.createObjectURL(attachment);
    return (
        <>
            <div className="relative h-10 w-[150px] shrink-0">
                <button
                    onClick={() => isImage && setIsPreviewOpen(!isPreviewOpen)}
                    className="focus-visible:ring-offset-background inline-flex shrink-0 cursor-pointer select-none items-center justify-center whitespace-nowrap text-nowrap border font-medium outline-none ring-blue-600 transition-[background,border-color,color,transform,opacity,box-shadow] focus-visible:ring-2 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:cursor-not-allowed disabled:text-gray-400 disabled:ring-0 has-[:focus-visible]:ring-2 [&>svg]:pointer-events-none [&>svg]:size-4 [&_svg]:shrink-0 bg-muted/70 h-10 px-4 text-sm has-[>svg]:px-3 border-muted-foreground/50 rounded-lg w-full gap-1 py-1 pl-1 pr-3"
                >
                    <div className="flex size-8 shrink-0 relative -translate-x-px items-center justify-center overflow-hidden rounded-sm">
                        {isImage ? (
                            <Image
                                src={url}
                                alt={attachment.name}
                                onLoad={() => URL.revokeObjectURL(url)}
                                className="border-alpha-400 aspect-square rounded-sm border object-cover"
                                fill
                            />
                        ) : (
                            <FileIcon className="h-4 w-4" />
                        )}
                    </div>
                    <div className="grid flex-1 gap-1 py-0.5 text-xs leading-none text-gray-500">
                        <div className="overflow-hidden text-ellipsis font-medium">
                            {attachment.name}
                        </div>
                        <div className="line-clamp-1 tabular-nums font-normal">
                            {formatSize(attachment.size)}
                        </div>
                    </div>
                </button>
                <button
                    onClick={() => onRemoveFile(attachment.name)}
                    className="focus-visible:ring-offset-background inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-1.5 whitespace-nowrap text-nowrap border font-medium outline-none ring-blue-600 transition-[background,border-color,color,transform,opacity,box-shadow] focus-visible:ring-2 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:ring-0 has-[:focus-visible]:ring-2 [&>svg]:pointer-events-none [&_svg]:shrink-0 bg-muted/70 border-muted-foreground/50 text-muted-foreground size-4 [&>svg]:size-2 rounded-full absolute right-0 top-0 -translate-y-1/3 translate-x-1/3 hover:bg-gray-100 focus:bg-gray-100 focus-visible:bg-gray-100"
                >
                    <X className="h-2 w-2" />
                    <span className="sr-only">Remove</span>
                </button>
            </div>
            {isPreviewOpen && (
                <ImagePreview
                    attachment={attachment}
                    onClose={() => setIsPreviewOpen(false)}
                />
            )}
        </>
    );
});
AttachmentItem.displayName = "AttachmentItem";

export function ImagePreview({
    attachment,
    onClose,
}: AttachmentItemProps & {
    onClose: () => void;
}) {
    const { url, dimensions } = useLocalImage(attachment);

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="flex flex-col gap-2 p-2 w-fit max-w-[90vw] md:max-w-3xl lg:max-w-4xl">
                <DialogHeader className="sr-only">
                    <DialogTitle>{attachment.name}</DialogTitle>
                    <DialogDescription>{attachment.name}</DialogDescription>
                </DialogHeader>

                <div className="relative w-full flex-1 overflow-hidden rounded-lg">
                    {url && dimensions.width > 0 && (
                        <div className="relative max-h-[70vh] flex items-center justify-center">
                            <Image
                                alt={attachment.name}
                                src={url}
                                className="rounded-lg object-contain"
                                width={dimensions.width}
                                height={dimensions.height}
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "70vh",
                                    height: "auto",
                                    width: "auto",
                                }}
                                priority
                                unoptimized
                            />
                        </div>
                    )}
                </div>

                <div className="mt-2 px-2 text-sm text-gray-500 truncate">
                    {attachment.name}.{attachment.type.split("/")[1]}
                </div>
            </DialogContent>
        </Dialog>
    );
}
