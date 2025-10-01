import React, { useState } from "react";
import { Link } from "react-router-dom";

const topics = [
  { id: "life", label: "Life", color: "pink", selected: true },
  { id: "art", label: "Art", color: "green", selected: false },
  { id: "design", label: "Design", color: "blue", selected: false },
  { id: "technology", label: "Technology", color: "#c9b71f", selected: false },
];

export const ShareTreasureMainContentSection = (): JSX.Element => {
  const [linkUrl, setLinkUrl] = useState("");
  const [title, setTitle] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [selectedTopics, setSelectedTopics] = useState(topics);
  const [coverImage, setCoverImage] = useState(
    "https://c.animaapp.com/qjmVjlpe/img/preview-image.svg",
  );

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.map((topic) => ({
        ...topic,
        selected: topic.id === topicId,
      })),
    );
  };

  const handleRecommendationChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const value = e.target.value;
    if (value.length <= 1000) {
      setRecommendation(value);
    }
  };

  const getTopicColorClasses = (color: string, selected: boolean) => {
    const baseClasses =
      "inline-flex items-center gap-[5px] px-2.5 py-2 relative flex-[0_0_auto] rounded-[50px] border border-solid cursor-pointer transition-all";

    switch (color) {
      case "pink":
        return selected
          ? `${baseClasses} border-pink bg-[linear-gradient(0deg,rgba(234,125,183,0.2)_0%,rgba(234,125,183,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]`
          : `${baseClasses} border-pink`;
      case "green":
        return selected
          ? `${baseClasses} border-green bg-[linear-gradient(0deg,rgba(43,134,73,0.2)_0%,rgba(43,134,73,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]`
          : `${baseClasses} border-green`;
      case "blue":
        return selected
          ? `${baseClasses} border-blue bg-[linear-gradient(0deg,rgba(33,145,251,0.2)_0%,rgba(33,145,251,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]`
          : `${baseClasses} border-blue`;
      default:
        return selected
          ? `${baseClasses} border-[#c9b71f] bg-[linear-gradient(0deg,rgba(201,183,31,0.2)_0%,rgba(201,183,31,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]`
          : `${baseClasses} border-[#c9b71f]`;
    }
  };

  const getTopicTextColor = (color: string) => {
    switch (color) {
      case "pink":
        return "text-pink";
      case "green":
        return "text-green";
      case "blue":
        return "text-blue";
      default:
        return "text-[#c9b71f]";
    }
  };

  const selectedTopic = selectedTopics.find((topic) => topic.selected);

  return (
    <div className="flex items-start gap-[60px] relative self-stretch w-full flex-[0_0_auto]">
      <div className="flex flex-col items-start gap-[30px] pl-0 pr-[60px] py-0 relative flex-1 grow border-r [border-right-style:solid] border-light-grey">
        <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex flex-col w-[60px] h-[23px] items-start justify-center gap-2.5 relative">
            <label className="relative flex items-center justify-center w-fit mt-[-2.00px] font-p-l font-[number:var(--p-l-font-weight)] text-transparent text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
              <span className="text-[#f23a00] font-p-l [font-style:var(--p-l-font-style)] font-[number:var(--p-l-font-weight)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] text-[length:var(--p-l-font-size)]">
                *
              </span>
              <span className="text-[#686868] font-p-l [font-style:var(--p-l-font-style)] font-[number:var(--p-l-font-weight)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] text-[length:var(--p-l-font-size)]">
                Link
              </span>
            </label>
          </div>

          <div className="flex items-center px-[15px] py-2.5 relative self-stretch w-full flex-[0_0_auto] bg-white rounded-[15px] border border-solid border-light-grey">
            <div className="inline-flex items-center justify-center gap-2.5 px-0 py-[5px] relative flex-[0_0_auto] rounded-[15px]">
              <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-lg tracking-[0] leading-5 whitespace-nowrap">
                http://
              </div>
            </div>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="flex-1 ml-2 [font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg tracking-[0] leading-5 placeholder:text-medium-grey"
              placeholder="Enter your link here..."
              aria-label="Link URL"
            />
          </div>
        </div>

        <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
          <label className="relative w-[60px] mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-transparent text-base tracking-[0] leading-4">
            <span className="text-[#f23a00] leading-[var(--p-line-height)] font-p [font-style:var(--p-font-style)] font-[number:var(--p-font-weight)] tracking-[var(--p-letter-spacing)] text-[length:var(--p-font-size)]">
              *
            </span>
            <span className="text-[#686868] text-[length:var(--p-l-font-size)] leading-[var(--p-l-line-height)] font-p-l [font-style:var(--p-l-font-style)] font-[number:var(--p-l-font-weight)] tracking-[var(--p-l-letter-spacing)]">
              Title
            </span>
          </label>

          <div className="flex items-start gap-[5px] px-[15px] py-2.5 self-stretch w-full bg-white relative flex-[0_0_auto] rounded-[15px] border border-solid border-light-grey">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="relative w-full mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-lg tracking-[0] leading-[23.4px] placeholder:text-medium-grey placeholder:font-normal"
              placeholder="Enter title..."
              aria-label="Title"
            />
          </div>
        </div>

        <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex w-[60px] items-center gap-2.5 relative flex-[0_0_auto]">
            <label className="items-center justify-center w-fit mt-[-1.00px] font-p-l font-[number:var(--p-l-font-weight)] text-transparent text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap relative flex [font-style:var(--p-l-font-style)]">
              <span className="text-[#f23a00] font-p-l [font-style:var(--p-l-font-style)] font-[number:var(--p-l-font-weight)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] text-[length:var(--p-l-font-size)]">
                *
              </span>
              <span className="text-[#686868] font-p-l [font-style:var(--p-l-font-style)] font-[number:var(--p-l-font-weight)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] text-[length:var(--p-l-font-size)]">
                Cover
              </span>
            </label>
          </div>

          <div
            className="relative self-stretch w-full h-[260px] border border-dashed border-medium-grey bg-cover bg-[50%_50%] cursor-pointer hover:border-dark-grey transition-colors"
            style={{ backgroundImage: `url(${coverImage})` }}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    setCoverImage(e.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }}
            role="button"
            tabIndex={0}
            aria-label="Upload cover image"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                (e.target as HTMLElement).click();
              }
            }}
          />
        </div>

        <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
          <label className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-transparent text-base tracking-[0] leading-4">
            <span className="text-[#f23a00] leading-[var(--p-line-height)] font-p [font-style:var(--p-font-style)] font-[number:var(--p-font-weight)] tracking-[var(--p-letter-spacing)] text-[length:var(--p-font-size)]">
              *
            </span>
            <span className="text-[#686868] text-[length:var(--p-l-font-size)] leading-[var(--p-l-line-height)] font-p-l [font-style:var(--p-l-font-style)] font-[number:var(--p-l-font-weight)] tracking-[var(--p-l-letter-spacing)]">
              Recommendation
            </span>
          </label>

          <div className="flex flex-col h-44 items-start justify-between px-[15px] py-2.5 relative self-stretch w-full bg-white rounded-[15px] border border-solid border-light-grey">
            <textarea
              value={recommendation}
              onChange={handleRecommendationChange}
              placeholder="Please describe why you recommend this link..."
              className="relative self-stretch flex-1 resize-none font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)] placeholder:text-medium-grey"
              aria-label="Recommendation"
            />
            <div className="relative self-stretch [font-family:'Maven_Pro',Helvetica] font-normal text-medium-grey text-base text-right tracking-[0] leading-[25px]">
              {recommendation.length}/1000
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
          <div className="relative w-fit mt-[-1.00px] font-p font-[number:var(--p-font-weight)] text-off-black text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] whitespace-nowrap [font-style:var(--p-font-style)]">
            Choose a topic
          </div>

          <div className="gap-2.5 inline-flex items-start relative flex-[0_0_auto]">
            {selectedTopics.map((topic) => (
              <div
                key={topic.id}
                className={getTopicColorClasses(topic.color, topic.selected)}
                onClick={() => handleTopicToggle(topic.id)}
                role="button"
                tabIndex={0}
                aria-pressed={topic.selected}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleTopicToggle(topic.id);
                  }
                }}
              >
                <div
                  className={`font-semibold relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] ${getTopicTextColor(topic.color)} text-sm tracking-[0] leading-[14px] whitespace-nowrap`}
                >
                  {topic.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="inline-flex flex-col items-start gap-5 relative flex-[0_0_auto]">
        <div className="flex w-[60px] items-center gap-2.5 relative flex-[0_0_auto]">
          <div className="relative flex items-center justify-center w-fit mt-[-1.00px] mr-[-4.00px] font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] whitespace-nowrap [font-style:var(--p-l-font-style)]">
            Preview
          </div>
        </div>

        <div className="flex flex-col items-start gap-10 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex flex-col w-[374px] items-start gap-[15px] p-5 relative flex-[0_0_auto] bg-white rounded-lg shadow-card-white">
            <div className="flex flex-col items-start justify-center gap-[15px] relative self-stretch w-full flex-[0_0_auto] rounded-[100px]">
              <div
                className="flex-col h-[188px] items-start justify-between p-2.5 self-stretch w-full bg-cover bg-[50%_50%] relative flex rounded-lg"
                style={{ backgroundImage: `url(${coverImage})` }}
              >
                {selectedTopic && (
                  <div
                    className={getTopicColorClasses(selectedTopic.color, true)}
                  >
                    <div
                      className={`font-bold relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] ${getTopicTextColor(selectedTopic.color)} text-sm tracking-[0] leading-[14px] whitespace-nowrap`}
                    >
                      {selectedTopic.label}
                    </div>
                  </div>
                )}

                <div className="flex flex-col items-end gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                  <div className="gap-[5px] px-2.5 py-[5px] bg-white rounded-[15px] overflow-hidden inline-flex items-start relative flex-[0_0_auto]">
                    <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-bold text-blue text-sm text-right tracking-[0] leading-[18.2px] whitespace-nowrap">
                      {linkUrl || "productdesign.com"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start gap-[15px] relative self-stretch w-full flex-[0_0_auto]">
                <h3 className="relative self-stretch mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-dark-grey text-[22px] tracking-[0] leading-[33px]">
                  {title || "Enter title..."}
                </h3>

                <div className="flex flex-col items-start gap-[15px] p-2.5 relative self-stretch w-full flex-[0_0_auto] rounded-lg bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
                  <p className="relative self-stretch mt-[-1.00px] [font-family:'Lato',Helvetica] font-normal text-dark-grey text-base tracking-[0] leading-6">
                    {recommendation ||
                      "Please describe why you recommend this link..."}
                  </p>

                  <div className="flex items-start justify-between relative self-stretch w-full flex-[0_0_auto]">
                    <div className="inline-flex items-center gap-2 relative flex-[0_0_auto]">
                      <img
                        className="w-4 h-4 object-cover relative aspect-[1]"
                        alt="Profile image"
                        src="https://c.animaapp.com/qjmVjlpe/img/-profile-image@2x.png"
                      />
                      <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-medium-dark-grey text-sm tracking-[0] leading-[19.6px] whitespace-nowrap">
                        User Name
                      </div>
                    </div>

                    <div className="inline-flex h-[25px] items-center gap-5 relative flex-[0_0_auto]">
                      <div className="relative w-fit [font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-sm tracking-[0] leading-[23px] whitespace-nowrap">
                        Today
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start justify-end gap-5 relative self-stretch w-full flex-[0_0_auto]">
            <button
              className="all-[unset] box-border inline-flex h-[45px] items-center justify-center gap-[30px] px-5 py-[15px] relative flex-[0_0_auto] rounded-[15px] cursor-pointer hover:bg-gray-100 transition-colors"
              type="button"
            >
              <div className="relative w-fit mt-[-8.50px] mb-[-4.50px] font-h-4 font-[number:var(--h-4-font-weight)] text-dark-grey text-[length:var(--h-4-font-size)] tracking-[var(--h-4-letter-spacing)] leading-[var(--h-4-line-height)] whitespace-nowrap [font-style:var(--h-4-font-style)]">
                Cancel
              </div>
            </button>

            <Link
              className="inline-flex items-center justify-center gap-[15px] px-5 py-2.5 relative flex-[0_0_auto] bg-red rounded-[50px] hover:bg-opacity-90 transition-all"
              to="/create"
            >
              <div className="relative w-fit mt-[-1.00px] [font-family:'Lato',Helvetica] font-semibold text-white text-lg tracking-[0] leading-[27px] whitespace-nowrap">
                Publish
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
