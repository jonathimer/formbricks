"use client";

import type { Survey } from "@formbricks/types/surveys";
import { AdvancedOptionToggle, DatePicker, Input, Label } from "@formbricks/ui";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import * as Collapsible from "@radix-ui/react-collapsible";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface ResponseOptionsCardProps {
  localSurvey: Survey;
  setLocalSurvey: (survey: Survey) => void;
}

export default function ResponseOptionsCard({ localSurvey, setLocalSurvey }: ResponseOptionsCardProps) {
  const [open, setOpen] = useState(false);
  const autoComplete = localSurvey.autoComplete !== null;
  const [redirectToggle, setRedirectToggle] = useState(false);
  const [surveyCloseOnDateToggle, setSurveyCloseOnDateToggle] = useState(false);

  const [redirectUrl, setRedirectUrl] = useState<string | null>("");
  const [surveyClosedMessageToggle, setSurveyClosedMessageToggle] = useState(false);
  const [surveyClosedMessage, setSurveyClosedMessage] = useState({
    heading: "Survey Completed",
    subheading: "This free & open-source survey has been closed",
  });
  const [closeOnDate, setCloseOnDate] = useState<Date>();

  const handleRedirectCheckMark = () => {
    setRedirectToggle((prev) => !prev);

    if (redirectToggle && localSurvey.redirectUrl) {
      setRedirectUrl(null);
      setLocalSurvey({ ...localSurvey, redirectUrl: null });
    }
  };

  const handleSurveyCloseOnDateToggle = () => {
    if (surveyCloseOnDateToggle && localSurvey.closeOnDate) {
      setSurveyCloseOnDateToggle(false);
      setCloseOnDate(undefined);
      setLocalSurvey({ ...localSurvey, closeOnDate: null });
      return;
    }

    if (surveyCloseOnDateToggle) {
      setSurveyCloseOnDateToggle(false);
      return;
    }
    setSurveyCloseOnDateToggle(true);
  };

  const handleRedirectUrlChange = (link: string) => {
    setRedirectUrl(link);
    setLocalSurvey({ ...localSurvey, redirectUrl: link });
  };

  const handleCloseSurveyMessageToggle = () => {
    setSurveyClosedMessageToggle((prev) => !prev);

    if (surveyClosedMessageToggle && localSurvey.surveyClosedMessage) {
      setLocalSurvey({ ...localSurvey, surveyClosedMessage: null });
    }
  };

  const handleCloseOnDateChange = (date: Date) => {
    const equivalentDate = date?.getDate();
    date?.setUTCHours(0, 0, 0, 0);
    date?.setDate(equivalentDate);

    setCloseOnDate(date);
    setLocalSurvey({ ...localSurvey, closeOnDate: date ?? null });
  };

  const handleClosedSurveyMessageChange = ({
    heading,
    subheading,
  }: {
    heading?: string;
    subheading?: string;
  }) => {
    const message = {
      heading: heading ?? surveyClosedMessage.heading,
      subheading: subheading ?? surveyClosedMessage.subheading,
    };

    setSurveyClosedMessage(message);
    setLocalSurvey({ ...localSurvey, surveyClosedMessage: message });
  };

  useEffect(() => {
    if (localSurvey.redirectUrl) {
      setRedirectUrl(localSurvey.redirectUrl);
      setRedirectToggle(true);
    }

    if (!!localSurvey.surveyClosedMessage) {
      setSurveyClosedMessage({
        heading: localSurvey.surveyClosedMessage.heading ?? surveyClosedMessage.heading,
        subheading: localSurvey.surveyClosedMessage.subheading ?? surveyClosedMessage.subheading,
      });
      setSurveyClosedMessageToggle(true);
    }

    if (localSurvey.closeOnDate) {
      setCloseOnDate(localSurvey.closeOnDate);
      setSurveyCloseOnDateToggle(true);
    }
  }, []);

  const handleCheckMark = () => {
    if (autoComplete) {
      const updatedSurvey: Survey = { ...localSurvey, autoComplete: null };
      setLocalSurvey(updatedSurvey);
    } else {
      const updatedSurvey: Survey = { ...localSurvey, autoComplete: 25 };
      setLocalSurvey(updatedSurvey);
    }
  };

  const handleInputResponse = (e) => {
    const updatedSurvey: Survey = { ...localSurvey, autoComplete: parseInt(e.target.value) };
    setLocalSurvey(updatedSurvey);
  };

  const handleInputResponseBlur = (e) => {
    if (parseInt(e.target.value) === 0) {
      toast.error("Response limit can't be set to 0");
      return;
    }

    const inputResponses = localSurvey?._count?.responses || 0;

    if (parseInt(e.target.value) <= inputResponses) {
      toast.error(
        `Response limit needs to exceed number of received responses (${localSurvey?._count?.responses}).`
      );
      return;
    }
  };

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={setOpen}
      className="w-full rounded-lg border border-slate-300 bg-white">
      <Collapsible.CollapsibleTrigger asChild className="h-full w-full cursor-pointer">
        <div className="inline-flex px-4 py-4">
          <div className="flex items-center pl-2 pr-5">
            <CheckCircleIcon className="h-8 w-8 text-green-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Response Options</p>
            <p className="mt-1 text-sm text-slate-500">Decide how and how long people can respond.</p>
          </div>
        </div>
      </Collapsible.CollapsibleTrigger>
      <Collapsible.CollapsibleContent>
        <hr className="py-1 text-slate-600" />
        <div className="p-3">
          {/* Close Survey on Limit */}
          <AdvancedOptionToggle
            htmlId="closeOnNumberOfResponse"
            isChecked={autoComplete}
            onToggle={handleCheckMark}
            title="Close survey on response limit"
            description="Automatically close the survey after a certain number of responses."
            childBorder={true}>
            <label htmlFor="autoCompleteResponses" className="cursor-pointer bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">
                Automatically mark the survey as complete after
                <Input
                  autoFocus
                  type="number"
                  min={localSurvey?._count?.responses ? (localSurvey?._count?.responses + 1).toString() : "1"}
                  id="autoCompleteResponses"
                  value={localSurvey.autoComplete?.toString()}
                  onChange={handleInputResponse}
                  onBlur={handleInputResponseBlur}
                  className="ml-2 mr-2 inline w-20 bg-white text-center text-sm"
                />
                completed responses.
              </p>
            </label>
          </AdvancedOptionToggle>
          {/* Close Survey on Date */}
          <AdvancedOptionToggle
            htmlId="closeOnDate"
            isChecked={surveyCloseOnDateToggle}
            onToggle={handleSurveyCloseOnDateToggle}
            title="Close survey on date"
            description="Automatically closes the survey at the beginning of the day (UTC)."
            childBorder={true}>
            <div className="flex cursor-pointer p-4">
              <p className="mr-2 mt-3 text-sm font-semibold text-slate-700">
                Automatically mark survey as complete on:
              </p>
              <DatePicker date={closeOnDate} handleDateChange={handleCloseOnDateChange} />
            </div>
          </AdvancedOptionToggle>

          {/* Redirect on completion */}
          {localSurvey.type === "link" && (
            <>
              <AdvancedOptionToggle
                htmlId="redirectUrl"
                isChecked={redirectToggle}
                onToggle={handleRedirectCheckMark}
                title="Redirect on completion"
                description="Redirect user to specified link on survey completion"
                childBorder={true}>
                <div className="w-full p-4">
                  <div className="flex w-full cursor-pointer items-center">
                    <p className="mr-2 w-[400px] text-sm font-semibold text-slate-700">
                      Redirect respondents here:
                    </p>
                    <Input
                      autoFocus
                      className="w-full bg-white"
                      type="url"
                      placeholder="https://www.example.com"
                      value={redirectUrl ? redirectUrl : ""}
                      onChange={(e) => handleRedirectUrlChange(e.target.value)}
                    />
                  </div>
                </div>
              </AdvancedOptionToggle>

              {/* Adjust Survey Closed Message */}
              <AdvancedOptionToggle
                htmlId="adjustSurveyClosedMessage"
                isChecked={surveyClosedMessageToggle}
                onToggle={handleCloseSurveyMessageToggle}
                title="Adjust 'Survey Closed' message"
                description="Change the message visitors see when the survey is closed."
                childBorder={true}>
                <div className="flex w-full items-center space-x-1 p-4 pb-4">
                  <div className="w-full cursor-pointer items-center  bg-slate-50">
                    <Label htmlFor="headline">Heading</Label>
                    <Input
                      autoFocus
                      id="heading"
                      className="mb-4 mt-2 bg-white"
                      name="heading"
                      defaultValue={surveyClosedMessage.heading}
                      onChange={(e) => handleClosedSurveyMessageChange({ heading: e.target.value })}
                    />

                    <Label htmlFor="headline">Subheading</Label>
                    <Input
                      className="mt-2 bg-white"
                      id="subheading"
                      name="subheading"
                      defaultValue={surveyClosedMessage.subheading}
                      onChange={(e) => handleClosedSurveyMessageChange({ subheading: e.target.value })}
                    />
                  </div>
                </div>
              </AdvancedOptionToggle>
            </>
          )}
        </div>
      </Collapsible.CollapsibleContent>
    </Collapsible.Root>
  );
}
