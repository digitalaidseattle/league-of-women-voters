import { Breadcrumbs, type BreadcrumbsProps } from "@mui/material";

const BreadcrumbsNav = (props: BreadcrumbsProps) => (
  <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }} {...props} />
);

export default BreadcrumbsNav;
