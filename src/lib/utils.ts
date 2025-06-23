import type { Message } from './api/messages';

export const findName = (userId: string, context: Message[]) => {
  const user = context.find((m) => m.sender.id === userId);
  return user?.sender.nickname || user?.sender.username || userId;
};

export const preprocess = (original: Message, context: Message[]): Message => {
  const message = JSON.parse(JSON.stringify(original)) as Message;
  const elements = message.elements;
  message.elements = [];

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    if (element.type === 'at') {
      const mention = `@${findName(element.data.qq, context)} `;
      const prev = message.elements[message.elements.length - 1];
      const next = elements[i + 1];

      if (prev?.type === 'text') {
        prev.data.text += mention;
      } else if (next?.type === 'text') {
        message.elements.push({
          type: 'text',
          data: { text: `${mention}${next.data.text}` }
        });
        elements.splice(i + 1, 1);
      } else {
        message.elements.push({
          type: 'text',
          data: { text: mention }
        });
      }
    } else {
      message.elements.push(JSON.parse(JSON.stringify(element)));
    }
  }

  message.content = message.elements
    .map((e) => {
      if (e.type === 'text') return e.data.text;
      if (e.type === 'image') return '[Image]';
      if (e.type === 'video') return '[Video]';
      if (e.type === 'file') return '[File]';
      if (e.type === 'record') return '[Audio]';
      return '';
    })
    .join('');

  return message;
};

export const getPlatformName = (platform: string): string => {
  switch (platform.toLowerCase()) {
    case 'qq':
      return 'QQ';
    default:
      return platform;
  }
};

export const getUrl = (url: string): string => '/api/proxy?url=' + encodeURIComponent(url);
