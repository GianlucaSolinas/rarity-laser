import {
  ErrorOutline,
  Pending,
  QuestionMarkOutlined,
  StarOutline,
} from '@mui/icons-material';
import { Chip } from '@mui/material';
import React from 'react';

const getIconStatus = (status) => {
  switch (status) {
    case 'ranked':
      return <StarOutline />;
    case 'failed':
      return <ErrorOutline />;
    case 'running':
      return <Pending />;
    case 'unranked':
    default:
      return <QuestionMarkOutlined />;
  }
};

const getColor = (status) => {
  switch (status) {
    case 'ranked':
      return 'success';
    case 'failed':
      return 'error';
    case 'running':
      return 'primary';
    case 'unranked':
    default:
      return 'secondary';
  }
};

const getLabel = (status) => {
  switch (status) {
    case 'ranked':
      return 'RANKED';
    case 'failed':
      return 'RANKING FAILED';
    case 'running':
      return 'RANKING RUNNING';
    case 'unranked':
    default:
      return 'UNRANKED';
  }
};

const RankStatus = ({ status }) => {
  return (
    <Chip
      size="small"
      variant="filled"
      icon={getIconStatus(status)}
      color={getColor(status)}
      label={getLabel(status)}
    ></Chip>
  );
};

export default RankStatus;
