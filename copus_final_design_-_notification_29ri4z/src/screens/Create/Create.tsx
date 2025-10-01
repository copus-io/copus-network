import React, { useState } from "react";
import { Link } from "react-router-dom";
import { UploadIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";

const topicData = [
  {
    label: "Life",
    color:
      "border-[#ea7db7] bg-[linear-gradient(0deg,rgba(234,125,183,0.2)_0%,rgba(234,125,183,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    textColor: "text-pink",
  },
  {
    label: "Art",
    color: "border-[#2b8649] bg-[linear-gradient(0deg,rgba(43,134,73,0.2)_0%,rgba(43,134,73,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    textColor: "text-green",
  },
  {
    label: "Design",
    color: "border-[#2191fb] bg-[linear-gradient(0deg,rgba(33,145,251,0.2)_0%,rgba(33,145,251,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    textColor: "text-blue",
  },
  {
    label: "Technology",
    color: "border-[#c9b71f] bg-[linear-gradient(0deg,rgba(201,183,31,0.2)_0%,rgba(201,183,31,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    textColor: "text-[#c9b71f]",
  },
];

export const Create = (): JSX.Element => {
  const [formData, setFormData] = useState({
    link: "",
    title: "",
    recommendation: "",
    selectedTopic: "Life",
    coverImage: null as File | null,
  });

  const [characterCount, setCharacterCount] = useState(0);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === "recommendation") {
      setCharacterCount(value.length);
    }
  };

  const handleTopicSelect = (topic: string) => {
    setFormData(prev => ({ ...prev, selectedTopic: topic }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, coverImage: file }));
    }
  };

  const selectedTopicData = topicData.find(topic => topic.label === formData.selectedTopic) || topicData[0];

  return (
    <div className="w-full min-h-screen bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
      <header className="flex items-start justify-between p-[30px] w-full bg-[linear-gradient(0deg,rgba(224,224,224,0.18)_0%,rgba(224,224,224,0.18)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
        <Link to="/" className="flex w-[45px] h-[45px] items-center justify-center gap-2.5 p-2.5 bg-red rounded-[100px]">
          <img
            className="w-7 h-7"
            alt="Ic fractopus open"
            src="https://c.animaapp.com/mftvplqrDArMzQ/img/ic-fractopus-open.svg"
          />
        </Link>

        <div className="flex items-center gap-5">
          <Button 
            className="flex items-center justify-center gap-[15px] px-5 py-2.5 bg-red rounded-[50px] h-auto hover:bg-red/90"
            asChild
          >
            <Link to="/published">
              <span className="[font-family:'Lato',Helvetica] font-bold text-white text-lg tracking-[0] leading-[27px] whitespace-nowrap">
                Publish
              </span>
            </Link>
          </Button>

          <Link to="/notification">
            <img
              className="w-[47px] h-[47px]"
              alt="Notification"
              src="https://c.animaapp.com/mftvplqrDArMzQ/img/notification.svg"
            />
          </Link>

          <Link to="/my-treasury">
            <Avatar className="w-[47px] h-[47px]">
              <AvatarImage src="https://c.animaapp.com/mftvplqrDArMzQ/img/-profile-image.png" alt="Profile" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      <div className="flex flex-col items-start gap-10 px-40 py-10 w-full">
        <div className="flex items-center gap-2.5 w-full">
          <h1 className="font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] text-center tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] [font-style:var(--h-3-font-style)]">
            Share treasure
          </h1>
        </div>

        <div className="flex items-start gap-[60px] w-full">
          <div className="flex flex-col items-start gap-[30px] pr-[60px] flex-1 border-r border-white">
            <div className="flex flex-col items-start gap-2.5 w-full">
              <label className="flex items-center gap-1">
                <span className="text-red">*</span>
                <span className="font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)]">
                  Link
                </span>
              </label>

              <div className="flex items-center px-[15px] py-2.5 w-full bg-white rounded-[15px] border border-white">
                <span className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-lg tracking-[0] leading-5 mr-2">
                  http://
                </span>
                <Input
                  value={formData.link}
                  onChange={(e) => handleInputChange("link", e.target.value)}
                  placeholder="Enter your link here"
                  className="border-0 bg-transparent p-0 focus-visible:ring-0 [font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg shadow-none"
                />
              </div>
            </div>

            <div className="flex flex-col items-start gap-2.5 w-full">
              <label className="flex items-center gap-1">
                <span className="text-red">*</span>
                <span className="font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)]">
                  Title
                </span>
              </label>

              <Input
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Please enter your link title"
                className="flex items-start gap-[5px] px-[15px] py-2.5 w-full bg-white rounded-[15px] border border-white [font-family:'Lato',Helvetica] font-normal text-dark-grey text-lg tracking-[0] leading-[23.4px] h-auto"
              />
            </div>

            <div className="flex flex-col items-start gap-2.5 w-full">
              <label className="flex items-center gap-1">
                <span className="text-red">*</span>
                <span className="font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)]">
                  Cover
                </span>
              </label>

              <div className="relative w-full h-[180px] border-2 border-dashed border-[#a8a8a8] bg-gray-50 rounded-lg flex flex-col items-center justify-center gap-4 hover:bg-gray-100 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadIcon className="w-12 h-12 text-gray-400" />
                <div className="text-center">
                  <p className="[font-family:'Lato',Helvetica] font-medium text-dark-grey text-lg">
                    {formData.coverImage ? formData.coverImage.name : "Click to upload cover image"}
                  </p>
                  <p className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-sm">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-2.5 w-full">
              <label className="flex items-center gap-1">
                <span className="text-red">*</span>
                <span className="font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)]">
                  Recommendation
                </span>
              </label>

              <div className="flex flex-col h-44 px-[15px] py-2.5 w-full bg-white rounded-[15px] border border-white">
                <Textarea
                  value={formData.recommendation}
                  onChange={(e) => handleInputChange("recommendation", e.target.value)}
                  placeholder="Please describe why you recommend this link..."
                  maxLength={1000}
                  className="flex-1 font-p-l font-[number:var(--p-l-font-weight)] text-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)] border-0 resize-none bg-transparent p-0 focus-visible:ring-0"
                />

                <div className="[font-family:'Maven_Pro',Helvetica] font-normal text-medium-grey text-base text-right tracking-[0] leading-[25px]">
                  {characterCount}/1000
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-2.5 w-full">
              <div className="[font-family:'Lato',Helvetica] font-normal text-off-black text-base tracking-[0] leading-[23px]">
                Choose a topic
              </div>

              <div className="flex items-start gap-2.5 flex-wrap">
                {topicData.map((topic, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className={`${formData.selectedTopic === topic.label ? topic.color : 'border-[#a8a8a8] bg-white'} inline-flex items-center gap-[5px] px-2.5 py-2 rounded-[50px] border border-solid cursor-pointer transition-all hover:opacity-80`}
                    onClick={() => handleTopicSelect(topic.label)}
                  >
                    <span
                      className={`font-semibold [font-family:'Lato',Helvetica] ${formData.selectedTopic === topic.label ? topic.textColor : 'text-medium-dark-grey'} text-sm tracking-[0] leading-[14px] whitespace-nowrap`}
                    >
                      {topic.label}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start gap-5 flex-shrink-0">
            <div className="font-p-l font-[number:var(--p-l-font-weight)] text-medium-dark-grey text-[length:var(--p-l-font-size)] tracking-[var(--p-l-letter-spacing)] leading-[var(--p-l-line-height)] [font-style:var(--p-l-font-style)]">
              Preview
            </div>

            <Card className="flex flex-col w-[374px] items-start gap-[15px] p-5 bg-white rounded-lg border-0 shadow-none">
              <CardContent className="flex flex-col items-start justify-center gap-[15px] w-full p-0">
                <div className="flex flex-col h-[188px] items-start justify-between p-2.5 w-full bg-gray-200 rounded-lg">
                  {formData.coverImage ? (
                    <div 
                      className="w-full h-full rounded-lg bg-cover bg-center flex flex-col justify-between p-2.5"
                      style={{ backgroundImage: `url(${URL.createObjectURL(formData.coverImage)})` }}
                    >
                      <Badge
                        variant="outline"
                        className={`${selectedTopicData.color} inline-flex items-center gap-[5px] px-2.5 py-2 rounded-[50px] border border-solid w-fit`}
                      >
                        <span className={`font-bold [font-family:'Lato',Helvetica] ${selectedTopicData.textColor} text-sm tracking-[0] leading-[14px] whitespace-nowrap`}>
                          {formData.selectedTopic}
                        </span>
                      </Badge>

                      <div className="flex justify-end">
                        <div className="inline-flex items-start gap-[5px] px-2.5 py-[5px] bg-white rounded-[15px] overflow-hidden">
                          <span className="[font-family:'Lato',Helvetica] font-bold text-blue text-sm text-right tracking-[0] leading-[18.2px] whitespace-nowrap">
                            {formData.link || "your-link.com"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gray-100 rounded-lg">
                      <UploadIcon className="w-8 h-8 text-gray-400" />
                      <span className="[font-family:'Lato',Helvetica] font-normal text-gray-500 text-sm">
                        Upload cover image
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-start gap-[15px] w-full">
                  <h3 className="[font-family:'Lato',Helvetica] font-semibold text-dark-grey text-[22px] tracking-[0] leading-[33px] min-h-[33px]">
                    {formData.title || "Please enter your link title"}
                  </h3>

                  <div className="flex flex-col items-start gap-[15px] p-2.5 w-full rounded-lg bg-[linear-gradient(0deg,rgba(224,224,224,0.2)_0%,rgba(224,224,224,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]">
                    <p className="[font-family:'Lato',Helvetica] font-normal text-dark-grey text-base tracking-[0] leading-6">
                      &quot;{formData.recommendation || "Please describe why you recommend this link..."}&quot;
                    </p>

                    <div className="flex items-start justify-between w-full">
                      <div className="inline-flex items-center gap-2">
                        <Avatar className="w-4 h-4">
                          <AvatarImage src="https://c.animaapp.com/mftvplqrDArMzQ/img/-profile-image.png" alt="Profile" />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>

                        <span className="[font-family:'Lato',Helvetica] font-semibold text-medium-dark-grey text-sm tracking-[0] leading-[19.6px] whitespace-nowrap">
                          Sophiaaaaa
                        </span>
                      </div>

                      <div className="inline-flex h-[25px] items-center">
                        <span className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-sm tracking-[0] leading-[23px] whitespace-nowrap">
                          Today
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
