import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import TitleHeader from "@/components/layout/TitleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import ContractPagesEditor, {
  createEmptyPage,
  type ContractPageData,
} from "@/components/contract/ContractPagesEditor";
import {
  useCreateContract,
  useGetContractTemplateById,
  useUpdateContract,
} from "@/services/api/contract.api";

interface TContractMetaForm {
  title: string;
  companyName: string;
}

const CreateTemplate = () => {
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const isEdit = !!params.id;

  const [pages, setPages] = useState<ContractPageData[]>([createEmptyPage()]);

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
      setPages(
        contractData.pages?.length ? contractData.pages : [createEmptyPage()]
      );
    }
  }, [isEdit, contractData, reset]);

  const onSubmit = (data: TContractMetaForm) => {
    if (isPending || isUpdating) return;

    if (isEdit) {
      updateTemplate({ ...data, pages, _id: params.id! });
      return;
    }

    createTemplate(
      { ...data, pages },
      {
        onSuccess: () => {
          if (returnTo) {
            navigate(returnTo);
            return;
          }
          reset();
          setPages([createEmptyPage()]);
        },
      }
    );
  };

  return (
    <main className="p-6 space-y-6">
      <TitleHeader
        title={isEdit ? "Edit Contract Template" : "Create New Contract Template"}
        description="Author the contract content across one or more letterhead pages"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6 space-y-4">
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
        </Card>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Contract Content</label>
          <p className="text-xs text-muted-foreground">
            Drag the dashed box in each page's preview to position and resize the content on the
            letterhead. Use "Add Page" for a multi-page contract.
          </p>
          <ContractPagesEditor pages={pages} onChange={setPages} />
        </div>

        <div className="flex justify-end gap-4 pt-2 border-t">
          <Button type="submit" disabled={isPending || isUpdating} className="min-w-[120px]">
            {isEdit ? "Update Contract" : "Create Contract"}
            {(isPending || isUpdating) && <LoaderCircle className="h-4 w-4 ml-2 animate-spin" />}
          </Button>
        </div>
      </form>
    </main>
  );
};

export default CreateTemplate;
