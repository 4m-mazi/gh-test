import NextImage from "next/image";

const customLoader = ({ src }) => {
  return src;
};

export default function Image(props) {
  if (process.env.isPreview) {
    return <NextImage {...props} loader={customLoader} />;
  } else {
    return <NextImage {...props} />;
  }
}
