import axios from "axios";

const api = axios.create({
  baseURL: "/api/user"
});

// Existing interfaces and functions...

const getUserInformationPath = () => `/information`;
export interface IGetUserInformationResponse {
  id: string,
  email: string,
  firstname: string,
  lastname: string,
  businessName: string,
  subscription: string,
  userId: string;
  logo_url?: string; 
  logo_updated_at?: string;
}

export const getUserInformation = async (): Promise<IGetUserInformationResponse | null> => {
  const { data } = await api.get<IGetUserInformationResponse>(getUserInformationPath());
  return data;
};

const updateUserInformationPath = () => `/updateInformation`;
export interface IUpdateUserInformationResponse {
  message?: string;
  logo_url?: string;
}
export interface IUpdateUserInformationRequest {
  userId?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  businessName?: string;
  subscription?: string;
  useCase?: string;
  logo_url?: string; 
  [key: string]: any;
}

export const updateUserInformation = async (
  data: IUpdateUserInformationRequest
): Promise<IUpdateUserInformationResponse> => {
  const response = await api.put<IUpdateUserInformationResponse>(
    updateUserInformationPath(),
    data
  );
  return response.data;
};

// ========== NEW LOGO UPLOAD FUNCTIONS ==========


const uploadLogoPath = () => `/uploadLogo`;

export interface IUploadLogoResponse {
  logo_url: string;
  message: string;
}

export const uploadLogo = async (file: File): Promise<IUploadLogoResponse> => {
  const formData = new FormData();
  formData.append('logo', file);
  
  const response = await api.post<IUploadLogoResponse>(
    uploadLogoPath(),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return response.data;
};

export const deleteLogo = async (): Promise<{ message: string }> => {
  const response = await api.delete('/logo');
  return response.data;
};
export const updateLogoUrl = async (logoUrl: string): Promise<IUpdateUserInformationResponse> => {
  const response = await api.put('/logoUrl', { logo_url: logoUrl });
  return response.data;
};

export const getSignedLogoUrl = async (
  fileName: string, 
  fileType: string
): Promise<{
  signedUrl: string;
  token: string;
  path: string;
  publicUrl: string;
  message: string;
}> => {
  const response = await api.post('/getSignedLogoUrl', { fileName, fileType });
  return response.data;
};