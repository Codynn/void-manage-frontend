import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import type { JSONContent } from "@tiptap/react";
import TitleHeader from "@/components/layout/TitleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ContractRichTextEditor from "@/components/contract/ContractRichTextEditor";
import ContractDocumentPreview from "@/components/contract/ContractDocumentPreview";
import { DEFAULT_CONTRACT_LAYOUT, type ContractLayout } from "@/components/contract/LetterheadCanvas";
import {
  useCreateCertificateTemplate,
  useGetCertificateTemplateById,
  useUpdateCertificateTemplate,
} from "@/services/api/certificate.api";
import type { CertificateType } from "@/types/certificate.type";

interface TCertificateMetaForm {
  type: CertificateType;
  title: string;
  companyName: string;
}

const EMPTY_CONTENT: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

const CreateCertificateTemplate = () => {
  const params = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = !!params.id;

  const [content, setContent] = useState<JSONContent>(EMPTY_CONTENT);
  const [layout, setLayout] = useState<ContractLayout>(DEFAULT_CONTRACT_LAYOUT);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TCertificateMetaForm>({
    defaultValues: {
      type: (searchParams.get("type") as CertificateType) || "completion",
      title: "",
      companyName: "",
    },
  });

  //   API CALLS
  const { mutate: createTemplate, isPending } = useCreateCertificateTemplate();
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateCertificateTemplate();
  const { data: templateData } = useGetCertificateTemplateById(params.id);

  useEffect(() => {
    if (isEdit && templateData) {
      reset({
        type: templateData.type,
        title: templateData.title,
        companyName: templateData.companyName,
      });
      setContent(templateData.content || EMPTY_CONTENT);
      setLayout(templateData.layout || DEFAULT_CONTRACT_LAYOUT);
    }
  }, [isEdit, templateData, reset]);

  const onSubmit = (data: TCertificateMetaForm) => {
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
    <main className="min-h-screen p-6 max-w-7xl mx-auto space-y-6">
      <TitleHeader
        title={isEdit ? "Edit Certificate Template" : "Create New Certificate Template"}
        description="Author the certificate content and position it on the letterhead"
        link="/admin/certificates"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium text-foreground">
                Certificate Type <span className="text-destructive">*</span>
              </label>
              <Controller
                name="type"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="type" className="w-full">
                      <SelectValue placeholder="Select certificate type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completion">Internship Completion Certificate</SelectItem>
                      <SelectItem value="recommendation">Letter of Recommendation</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
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
            <label htmlFor="title" className="text-sm font-medium text-foreground">
              Certificate Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="title"
              placeholder="e.g., Certificate of Internship Completion"
              {...register("title", { required: "Title is required" })}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Certificate Content</label>
            <ContractRichTextEditor content={content} onChange={setContent} />
            <p className="text-xs text-muted-foreground">
              Drag the dashed box in the preview to position and resize the content on the letterhead.
            </p>
          </div>

          <div className="flex justify-end gap-4 pt-2 border-t">
            <Button type="submit" disabled={isPending || isUpdating} className="min-w-[120px]">
              {isEdit ? "Update Template" : "Create Template"}
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

export default CreateCertificateTemplate;
