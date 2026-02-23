// Temporary analytics service to resolve import errors
export const trackPublishClick = (...args: any[]) => {
  // Console log for debugging, can be replaced with actual analytics
  console.log('Analytics: Publish click tracked', args);
};

export default {
  trackPublishClick
};