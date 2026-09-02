//   CompanyMasterOptionConfig — single source of truth for the
//   CompanyMasterConfig page sections.

//   Each entry defines one config section that will be rendered as a
//   Card with a Select dropdown. To add a new config section, simply
//   add a new entry to the array below — no page changes needed.

import type { ResourceBundle } from "@/hooks/useResourceBundle";

export type CompanyMasterOption = {
  // Unique module name stored in the backend table 
  moduleName: string;
  // Display title shown in the Card header 
  title: string;
  // Short description shown below the title 
  description: string;
  // Label for the select dropdown 
  label: string;
  // Placeholder text when nothing is selected 
  placeholder: string;
  // Helper text shown below the dropdown 
  helperText: string;
  // Key of the ResourceBundle array that holds the dropdown options 
  resourceBundleKey: keyof ResourceBundle;
};

export const COMPANY_MASTER_OPTIONS: CompanyMasterOption[] = [
  {
    moduleName: "Holiday_Based_On_Type",
    title: "Holiday Configuration",
    description: "Select how holidays are classified in the system.",
    label: "Holiday Based On Type",
    placeholder: "Select holiday type",
    helperText:
      "Determines the granularity for defining holidays (e.g. by State, City, or Zone).",
    resourceBundleKey: "HolidayBasedOnType",
  },
];
