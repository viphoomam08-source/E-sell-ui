type ChatParticipant = 'buyer' | 'seller';

type ChatRealtimeOptions = {
  buyerId: string | number;
  sellerId: string | number;
  participant: ChatParticipant;
  onMessage: () => void;
};

export async function subscribeToChat({
  buyerId,
  sellerId,
  participant,
  onMessage,
}: ChatRealtimeOptions): Promise<() => void> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
  const reverbKey = process.env.NEXT_PUBLIC_REVERB_APP_KEY;
  const tokenKeys = participant === 'buyer'
    ? ['buyer_token', 'access_token', 'token', 'jwt_token']
    : ['seller_token', 'access_token', 'token', 'jwt_token'];
  const token = tokenKeys
    .map((key) => window.localStorage.getItem(key))
    .find((value) => value?.trim());

  if (!apiBaseUrl || !reverbKey || !token || !buyerId || !sellerId) {
    throw new Error('Chat live updates need the API URL, Reverb app key, chat participants, and a signed-in account.');
  }

  const [{ default: Echo }, { default: PusherClient }] = await Promise.all([
    import('laravel-echo'),
    import('pusher-js'),
  ]);

  const scheme = process.env.NEXT_PUBLIC_REVERB_SCHEME || 'http';
  const websocketPort = Number(process.env.NEXT_PUBLIC_REVERB_PORT || 8082);
  const channelName = `chats.${buyerId}.${sellerId}`;
  const echo = new Echo({
    broadcaster: 'reverb',
    client: new PusherClient(reverbKey, {
      cluster: 'mt1',
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || new URL(apiBaseUrl).hostname,
      wsPort: websocketPort,
      wssPort: websocketPort,
      forceTLS: scheme === 'https',
      enabledTransports: scheme === 'https' ? ['wss'] : ['ws'],
      authEndpoint: participant === 'seller'
        ? `${apiBaseUrl}/seller/broadcasting/auth`
        : `${apiBaseUrl}/broadcasting/auth`,
      auth: {
        headers: { Authorization: `Bearer ${token}` },
      },
    }),
  });

  echo.private(channelName).listen('.chat.message.sent', onMessage);
  return () => {
    echo.leave(channelName);
    echo.disconnect();
  };
}
