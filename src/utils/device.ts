export const isMobileDevice = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const mobileKeywords = ['iphone', 'ipod', 'android', 'mobile', 'phone', 'tablet'];
  
  return mobileKeywords.some(keyword => userAgent.includes(keyword));
};

export const isSafariMobile = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return userAgent.includes('iphone') || userAgent.includes('ipod') || userAgent.includes('ipad');
};
