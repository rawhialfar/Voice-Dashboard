import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";

export type FilterOption = { value: string; label: string };

type Props = {
  value: string;
  onChange: (v: string) => void;
  options: FilterOption[];
  className?: string;
};

export default function FilterDropdown({ value, onChange, options, className }: Props) {
  const selectedLabel = options.find(o => o.value === value)?.label ?? value;
  return (
    <div className={className ?? "relative w-52 font-montserrat"}>
        <Listbox value={value} onChange={onChange}>
            {({ open }) => (
                <div className="relative">
                    <ListboxButton className="w-full px-3 py-2 border rounded-lg bg-background hover:ring-2 hover:ring-blue-400 text-left flex justify-between items-center">
                        <span>{selectedLabel}</span>
                        <ChevronUpDownIcon className={`w-5 h-5 text-gray transform transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`} />
                    </ListboxButton>
                    <ListboxOptions className="absolute mt-1 w-full bg-white border rounded-lg shadow-lg z-10">
                        { options.map(opt => (
                            <ListboxOption
                                key={opt.value}
                                value={opt.value}
                                className={({ active }) => `cursor-pointer select-none px-4 py-2 ${active ? "bg-blue-100" : ""}`}
                            >
                                {opt.label}
                            </ListboxOption>
                        ))} 
                    </ListboxOptions>
                </div>
            )}
        </Listbox>
    </div>
  );
}
