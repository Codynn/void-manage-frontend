import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import type { JSONContent } from "@tiptap/react";
import TitleHeader from "@/components/layout/TitleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import ContractRichTextEditor from "@/components/contract/ContractRichTextEditor";
import ContractDocumentPreview from "@/components/contract/ContractDocumentPreview";
import { DEFAULT_CONTRACT_LAYOUT, type ContractLayout } from "@/components/contract/LetterheadCanvas";
import {
  useCreateContract,
  useGetContractTemplateById,
  useUpdateContract,
} from "@/services/api/contract.api";

interface TContractMetaForm {
  title: string;
  companyName: string;
}

const EMPTY_CONTENT: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

const CreateTemplate = () => {
  const params = useParams<{ id?: string }>();
  const isEdit = !!params.id;

  const [content, setContent] = useState<JSONContent>(EMPTY_CONTENT);
  const [layout, setLayout] = useState<ContractLayout>(DEFAULT_CONTRACT_LAYOUT);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TContractMetaForm>({
    defaultValues: { title: "", companyName: "" },
  });

  //   API CALLS
  const { mutate: createTemplate, isPending } = useCreateContract();
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateContract();
  const { data: contractData } = useGetContractTemplateById(params.id);

  useEffect(() => {
    if (isEdit && contractData) {
      reset({ title: contractData.title, companyName: contractData.companyName });
      setContent(contractData.content || EMPTY_CONTENT);
      setLayout(contractData.layout || DEFAULT_CONTRACT_LAYOUT);
    }
  }, [isEdit, contractData, reset]);

  const onSubmit = (data: TContractMetaForm) => {
    if (isPending || isUpdating) return;

    if (isEdit) {
      updateTemplate({ ...data, content, layout, _id: params.id! });
      return;
    }

    createTemplate(
      { ...data, content, layout },
      {
        onSuccess: () => {
          reset();
          setContent(EMPTY_CONTENT);
          setLayout(DEFAULT_CONTRACT_LAYOUT);
        },
      }
    );
  };

  return (
    <main className="p-6 space-y-6">
      <TitleHeader
        title={isEdit ? "Edit Contract Template" : "Create New Contract Template"}
        description="Author the contract content and position it on the letterhead"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-foreground">
                Contract Title <span className="text-destructive">*</span>
              </label>
              <Input
                id="title"
                placeholder="e.g., Internship Agreement"
                {...register("title", { required: "Contract title is required" })}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="companyName" className="text-sm font-medium text-foreground">
                Company Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="companyName"
                placeholder="e.g., Void Nepal Private Limited"
                {...register("companyName", { required: "Company name is required" })}
                className={errors.companyName ? "border-destructive" : ""}
              />
              {errors.companyName && (
                <p className="text-sm text-destructive">{errors.companyName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Contract Content</label>
            <ContractRichTextEditor content={content} onChange={setContent} />
            <p className="text-xs text-muted-foreground">
              Drag the dashed box in the preview to position and resize the content on the letterhead.
            </p>
          </div>

          <div className="flex justify-end gap-4 pt-2 border-t">
            <Button type="submit" disabled={isPending || isUpdating} className="min-w-[120px]">
              {isEdit ? "Update Contract" : "Create Contract"}
              {(isPending || isUpdating) && <LoaderCircle className="h-4 w-4 ml-2 animate-spin" />}
            </Button>
          </div>
        </Card>

        <div className="lg:sticky lg:top-6">
          <ContractDocumentPreview
            content={content}
            layout={layout}
            editableLayout
            onLayoutChange={setLayout}
            mode="template"
          />
        </div>
      </form>
    </main>
  );
};

export default CreateTemplate;
