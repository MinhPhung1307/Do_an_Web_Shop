import axios from "axios";

export const axiosJWT = axios.create();

export const SignUpUser = async (data) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/user/sign-up`,
    data
  );
  return res.data;
};

export const verifyEmail = async (token) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/user/verify-email?token=${token}`
  );
  return res;
};

export const loginUser = async (data) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/user/sign-in`,
    data
  );
  return res.data;
};

export const logoutUser = async () => {
  const res = await axios.post(`${process.env.REACT_APP_API_URL}/user/log-out`);
  return res.data;
};

export const getDetailsUser = async (id, access_token) => {
  const res = await axiosJWT.get(
    `${process.env.REACT_APP_API_URL}/user/get-details/${id}`,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};

export const refreshToken = async () => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/user/refresh-token`,
    {
      withCredentials: true,
    }
  );
  return res.data;
};

export const updateUser = async (id, data, access_token) => {
  const res = await axios.put(
    `${process.env.REACT_APP_API_URL}/user/update-user/${id}`,
    data,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};

export const updatePassword = async (id, data, access_token) => {
  const res = await axios.put(
    `${process.env.REACT_APP_API_URL}/user/update-password/${id}`,
    data,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};

export const getAllUser = async (access_token) => {
  const res = await axios.get(`${process.env.REACT_APP_API_URL}/user/getAll/`, {
    headers: {
      token: `Bearer ${access_token}`,
    },
  });
  return res.data;
};

// gọi api yêu cầu thay đổi trạng thái của user
export const updateState = async (id, access_token) => {
  const res = await axios.put(
    `${process.env.REACT_APP_API_URL}/user/update-state/${id}`,
    {},
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};

// gọi api yêu cầu xóa user
export const deleteUser = async (id, access_token) => {
  const res = await axios.delete(
    `${process.env.REACT_APP_API_URL}/user/delete-user/${id}`,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};

export const addcart = async (id, access_token) => {
  // 'id' ở đây là product_id

  const res = await axios.put(
    `${process.env.REACT_APP_API_URL}/user/add-cart/${id}`, // product_id được truyền qua URL params
    {}, // Body rỗng hoặc một đối tượng trống nếu không có dữ liệu nào khác cần gửi
    {
      headers: {
        token: `Bearer ${access_token}`, // access_token sẽ được dùng để xác thực và lấy userId trên server
      },
    }
  );
  return res.data;
};
