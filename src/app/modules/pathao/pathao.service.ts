import axios from 'axios';

const PATHAO_BASE_URL = process.env.PATHAO_BASE_URL!;
const PATHAO_CLIENT_ID = process.env.PATHAO_CLIENT_ID!;
const PATHAO_CLIENT_SECRET = process.env.PATHAO_CLIENT_SECRET!;
const PATHAO_USERNAME = process.env.PATHAO_USERNAME!;
const PATHAO_PASSWORD = process.env.PATHAO_PASSWORD!;
const PATHAO_STORE_ID = Number(process.env.PATHAO_STORE_ID);

const getPathaoToken = async () => {
  const response = await axios.post(
    `${PATHAO_BASE_URL}/aladdin/api/v1/issue-token`,
    {
      client_id: PATHAO_CLIENT_ID,
      client_secret: PATHAO_CLIENT_SECRET,
      username: PATHAO_USERNAME,
      password: PATHAO_PASSWORD,
      grant_type: 'password',
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    },
  );

  console.log('PATHAO TOKEN RESPONSE:', response.data);

  return response.data.access_token;
};

export const createPathaoOrder = async (order: any) => {
  const accessToken = await getPathaoToken();

  const recipientName = order.name || order.user?.name || 'Customer';

  const recipientPhone = order.phone || order.user?.phone;

  const recipientAddress = [order.address, order.thana, order.district]
    .filter(Boolean)
    .join(', ');

  const itemQuantity =
    order.items?.reduce(
      (total: number, item: any) => total + Number(item.quantity || 0),
      0,
    ) || 1;

  const itemDescription =
    order.items?.map((item: any) => item.name).join(', ') || 'Product';

  const payload = {
    store_id: PATHAO_STORE_ID,

    merchant_order_id: order.id,

    recipient_name: recipientName,

    recipient_phone: recipientPhone,

    recipient_address: recipientAddress,

    delivery_type: 48,

    item_type: 2,

    item_quantity: itemQuantity,

    // Pathao minimum weight = 0.5 KG
    item_weight: '0.5',

    item_description: itemDescription,

    special_instruction: order.note || '',

    amount_to_collect: Math.round(Number(order.total || 0)),
  };

  const response = await axios.post(
    `${PATHAO_BASE_URL}/aladdin/api/v1/orders`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    },
  );

  console.log(response);

  return response.data;
};

export const getPathaoStores = async () => {
  const accessToken = await getPathaoToken();

  const response = await axios.get(`${PATHAO_BASE_URL}/aladdin/api/v1/stores`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  console.log('PATHAO STORES:', response.data);

  return response.data;
};
