import React from "react";
import { TopicDto } from "../../types/api-types";
import MultiSelectDropdown from "../common/MultiSelectDropdown";

interface Props {
  topics: TopicDto[];
  selectedTopicIds: number[];
  onChange: (topicIds: number[]) => void;
  loadedTopics: boolean;
}

const TopicSectionFilter: React.FC<Props> = ({
  topics,
  selectedTopicIds,
  onChange,
  loadedTopics
}) => {
  // Уникальные секции
  const sections = Array.from(new Set(topics.map((t) => t.section)));

  // Сопоставление section -> topicIds
  const sectionToTopics = sections.reduce<Record<string, number[]>>(
    (acc, section) => {
      acc[section] = topics
        .filter((t) => t.section === section)
        .map((t) => t.topicId);
      return acc;
    },
    {}
  );

  // Обработка флажка секции
  const toggleSection = (section: string) => {
    const topicIdsInSection = sectionToTopics[section];
    const isFullySelected = topicIdsInSection.every((id) =>
      selectedTopicIds.includes(id)
    );

    const updated = isFullySelected
      ? selectedTopicIds.filter((id) => !topicIdsInSection.includes(id))
      : Array.from(new Set([...selectedTopicIds, ...topicIdsInSection]));

    onChange(updated.filter((id) => id !== -1)); // удалить -1 если попал
  };

  const isSectionSelected = (section: string) => {
    const topicIdsInSection = sectionToTopics[section];
    return topicIdsInSection.every((id) => selectedTopicIds.includes(id));
  };

  const isEmpty = loadedTopics && topics.length === 0;
  return (
    <div className="flex flex-col gap-2">
      {/* Флажки секций */}
      {!isEmpty && (
        <div className="flex flex-col gap-2">
          {sections.map((section) => (
            <label
              key={section}
              className="flex items-center gap-1 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={isSectionSelected(section)}
                onChange={() => toggleSection(section)}
                className="accent-primary"
              />
              <span className="text-md">{section}</span>
            </label>
          ))}
        </div>
      )}

      {/* Dropdown тем */}
      <MultiSelectDropdown
        label="Темы"
        options={
          isEmpty
            ? [
                {
                  id: -1,
                  label: "отсутствует список тем",
                  disabled: true,
                },
              ]
            : topics.map((t) => ({
                id: t.topicId,
                label: t.topic,
              }))
        }
        selected={selectedTopicIds}
        onChange={(ids) => onChange(ids.filter((id) => id !== -1))}
      />
    </div>
  );
};

export default TopicSectionFilter;
