import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { LoaderCircle, Plus, Settings, ExternalLink, Edit, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import type { ILinkBase, TLinkFormValues } from "@/types/links.type";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useGetUsers } from "@/services/api/user.api";
import type { IUserData } from "../user";
import { Input } from "../ui/input";
import { useCreateLink, useGetMyLinks, useUpdateLink, useDeleteLink } from "@/services/api/link.api";
import { useState, useEffect } from "react";

const CreateLinkDialog = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [editLink, setEditLink] = useState<ILinkBase | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFormMode, setIsFormMode] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    setValue,
    reset,
  } = useForm<TLinkFormValues>({
    defaultValues: {
      title: "",
      url: "",
      category: "",
      assignedTo: [],
      visibleToInterns: false,
    },
  });

  //   API CALLS
  const { data: usersList } = useGetUsers();
  const { mutate: createLink, isPending: isCreating } = useCreateLink();
  const { mutate: updateLink, isPending: isUpdating } = useUpdateLink();
  const { mutate: deleteLink, isPending: isDeleting } = useDeleteLink();
  const { data: myLinks, isLoading: isMyLinksLoading } = useGetMyLinks(currentPage);

  const onSubmit = (data: TLinkFormValues) => {
    if (editLink) {
      // Update existing link
      updateLink({ id: editLink._id, data }, {
        onSuccess: () => {
          setOpen(false);
          setEditLink(null);
          setIsFormMode(false);
          reset({
            title: "",
            url: "",
            category: "",
            assignedTo: [],
            visibleToInterns: false,
          });
        },
      });
    } else {
      // Create new link
      createLink(data, {
        onSuccess: () => {
          setOpen(false);
          reset({
            title: "",
            url: "",
            category: "",
            assignedTo: [],
            visibleToInterns: false,
          });
        },
      });
    }
  };

  const handleEdit = (link: ILinkBase) => {
    setEditLink(link);
    setIsFormMode(true);
    // Populate form with link data
    setValue("title", link.title);
    setValue("url", link.url);
    setValue("category", link.category);
    setValue("assignedTo", link.assignedTo);
    setValue("visibleToInterns", link.visibleToInterns);
  };

  const handleDelete = (linkId: string) => {
    if (window.confirm("Are you sure you want to delete this link?")) {
      deleteLink(linkId);
    }
  };

  const handleRedirect = (url: string) => {
    window.open(url, "_blank");
  };

  const handleAddNew = () => {
    setEditLink(null);
    setIsFormMode(true);
    reset({
      title: "",
      url: "",
      category: "",
      assignedTo: [],
      visibleToInterns: false,
    });
  };

  const handleBackToList = () => {
    setIsFormMode(false);
    setEditLink(null);
    reset({
      title: "",
      url: "",
      category: "",
      assignedTo: [],
      visibleToInterns: false,
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset form and states when dialog closes
  useEffect(() => {
    if (!open) {
      setIsFormMode(false);
      setEditLink(null);
      setCurrentPage(1);
      reset({
        title: "",
        url: "",
        category: "",
        assignedTo: [],
        visibleToInterns: false,
      });
    }
  }, [open, reset]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Settings className="mr-2" />
          Manage Links
        </Button>
      </DialogTrigger>
      <DialogContent className="font-poppins sm:max-w-2xl">
        <DialogHeader className="gap-0 text-sm ">
          <h3 className="text-xl font-semibold">
            {isFormMode ? (editLink ? "Edit Link" : "Create Link") : "Manage Links"}
          </h3>
          <p>
            {isFormMode
              ? (editLink ? "Update your link details" : "Add a new quick access link")
              : "Add and manage your quick access links"
            }
          </p>
        </DialogHeader>

        {isFormMode ? (
          <>
            {editLink && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBackToList}
                className="self-start"
              >
                ← Back to Links
              </Button>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex gap-2 items-center ">
                <span className="flex-1">
                  <label htmlFor="">Title</label>
                  <Input type="text" {...register("title", { required: true })} />
                  {errors.title && (
                    <p className="text-red-500">This field is required</p>
                  )}
                </span>

                <span className="flex-1">
                  <label htmlFor="">URL</label>
                  <Input type="url" {...register("url", { required: true })} />
                  {errors.url && (
                    <p className="text-red-500">This field is required</p>
                  )}
                </span>
              </div>

              <div className="flex gap-2 items-start">
                <span className="flex-1">
                  <label htmlFor="">Category</label>
                  <Controller
                    control={control}
                    name="category"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                          <SelectItem value="GITHUB">GitHub</SelectItem>
                          <SelectItem value="PORTFOLIO">Portfolio</SelectItem>
                          <SelectItem value="DOCUMENT">Document</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </span>

                <span className="flex-1">
                  <label htmlFor="">Assign To:</label>
                  <Controller
                    control={control}
                    name="assignedTo"
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Select
                          value=""
                          onValueChange={(value) => {
                            if (value && !field.value.includes(value)) {
                              field.onChange([...field.value, value]);
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select interns to assign" />
                          </SelectTrigger>
                          <SelectContent>
                            {usersList?.items
                              ?.filter((user: IUserData) => !field.value.includes(user._id))
                              ?.map((user: IUserData) => (
                                <SelectItem key={user._id} value={user._id}>
                                  {user.username}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>

                        {field.value.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {field.value.map((userId: string) => {
                              const user = usersList?.items?.find((u: IUserData) => u._id === userId);
                              return (
                                <div
                                  key={userId}
                                  className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                                >
                                  <span>{user?.username || 'Unknown User'}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      field.onChange(field.value.filter((id: string) => id !== userId));
                                    }}
                                    className="hover:bg-blue-200 rounded-full p-0.5"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  />
                </span>
              </div>

              <span className="flex items-center justify-between">
                <label htmlFor="">Visible to Interns? </label>

                <span className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => setValue("visibleToInterns", true)}
                    variant={watch("visibleToInterns") ? "default" : "outline"}
                    className=""
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setValue("visibleToInterns", false)}
                    variant={watch("visibleToInterns") ? "outline" : "default"}
                    className=""
                  >
                    No
                  </Button>
                </span>
              </span>

              <Button
                disabled={isCreating || isUpdating}
                type="submit"
                className="w-full mt-2"
              >
                {editLink ? "Update Link" : "Create Link"}
                {(isCreating || isUpdating) && (
                  <LoaderCircle className="w-4 h-4 ml-2 animate-spin" />
                )}
              </Button>
            </form>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">Current Links ({myLinks?.totalItems || 0})</h4>
              <Button onClick={handleAddNew} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add New Link
              </Button>
            </div>

            {isMyLinksLoading ? (
              <div className="flex justify-center py-8">
                <LoaderCircle className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <>
                {myLinks?.items?.length > 0 ? (
                  <>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {myLinks?.items?.map((link: ILinkBase & { assignedBy: string; createdAt: string; updatedAt: string; __v: number }) => (
                        <div
                          key={link._id}
                          className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className="font-medium truncate">{link.title}</h5>
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                  {link.category}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2 truncate">{link.url}</p>
                              <div className="flex flex-col gap-2 text-xs text-gray-500">
                                <span>Visible to interns: {link.visibleToInterns ? "Yes" : "No"}</span>
                                <span>Created: {new Date(link.createdAt).toLocaleDateString()}</span>
                                {link.assignedTo && link.assignedTo.length > 0 && (
                                  <div className="flex items-center gap-1 flex-wrap">
                                    <span>Assigned to:</span>
                                    {link.assignedTo.map((userId: string, index: number) => {
                                      const user = usersList?.items?.find((u: IUserData) => u._id === userId);
                                      return (
                                        <span key={userId} className="bg-gray-100 px-2 py-1 rounded text-xs">
                                          {user?.username || 'Unknown User'}
                                          {index < link.assignedTo.length - 1 && ','}
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRedirect(link.url)}
                                title="Open link"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(link)}
                                title="Edit link"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(link._id)}
                                disabled={isDeleting}
                                title="Delete link"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {myLinks.totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: myLinks.totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              size="sm"
                              variant={currentPage === page ? "default" : "outline"}
                              onClick={() => handlePageChange(page)}
                              className="w-8 h-8"
                            >
                              {page}
                            </Button>
                          ))}
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === myLinks.totalPages}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No links created yet</p>
                    <Button onClick={handleAddNew}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Link
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateLinkDialog;
