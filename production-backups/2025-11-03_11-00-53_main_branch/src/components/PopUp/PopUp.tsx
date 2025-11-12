import { XIcon } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface PopUpProps {
  title: string;
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  placeholder?: string;
  isTextarea?: boolean;
}

export const PopUp = ({
  title,
  value,
  onSave,
  onCancel,
  placeholder = "Enter value",
  isTextarea = false
}: PopUpProps): JSX.Element => {
  const [inputValue, setInputValue] = React.useState(value);

  const handleSave = () => {
    onSave(inputValue);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="flex flex-col w-[500px] items-center justify-center gap-5 p-[30px] bg-white rounded-[15px] shadow-lg">
        <div className="flex justify-end w-full">
          <Button variant="ghost" size="sm" className="h-auto p-1" onClick={onCancel}>
            <XIcon className="w-6 h-6 text-gray-400" />
          </Button>
        </div>

        <div className="flex flex-col items-start gap-[30px] pt-0 pb-5 px-0 relative self-stretch w-full flex-[0_0_auto]">
          <div className="inline-flex flex-col items-start gap-[30px] relative flex-[0_0_auto]">
            <div className="inline-flex items-center gap-[5px] relative flex-[0_0_auto]">
              <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-off-black text-2xl tracking-[0] leading-[23px] whitespace-nowrap">
                {title}
              </div>
            </div>

            {isTextarea ? (
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder}
                className="w-[440px] h-[120px] px-3 py-2.5 bg-white rounded-md border-2 border-[#a8a8a8] shadow-inputs resize-none [font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg focus-visible:ring-1 focus-visible:ring-gray-300"
              />
            ) : (
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder}
                className="w-[440px] h-[51px] px-3 py-2.5 bg-white rounded-md border-2 border-[#a8a8a8] shadow-inputs [font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg focus:outline-none focus:ring-1 focus:ring-gray-300"
                autoFocus
              />
            )}
          </div>

          <div className="flex items-center justify-end gap-5 relative self-stretch w-full flex-[0_0_auto]">
            <Button variant="ghost" className="h-auto px-5 py-2.5 rounded-[15px]" onClick={onCancel}>
              <div className="relative w-fit mt-[-2.00px] font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
                Cancel
              </div>
            </Button>

            <Button
              className="h-auto px-5 py-2.5 bg-red rounded-[50px] hover:bg-red/90"
              onClick={handleSave}
              disabled={!inputValue.trim()}
            >
              <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-white text-lg tracking-[0] leading-[25.2px] whitespace-nowrap">
                Save
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};