/* eslint-disable react/prop-types */
import { Form, Input } from "antd";

const FormInput = ({ name, label, placeholder, type = "text", rules }) => {
  return (
    <Form.Item name={name} label={label} rules={rules}>
      <Input placeholder={placeholder} type={type} />
    </Form.Item>
  );
};

export default FormInput;