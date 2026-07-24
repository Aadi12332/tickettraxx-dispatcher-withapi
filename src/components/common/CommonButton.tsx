import React from "react";

interface CommonButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "xs" |"sm" | "md" | "lg" | "xl";
  className?: string;
  type?: "button" | "submit" | "reset";
  iconOnly?: boolean;
  disabled?: boolean;
}

const variantStyles = {
  primary: "bg-[#233B73] text-white hover:bg-[#1c305d] cursor-pointer font-normal",
  secondary: "bg-white text-black border border-[#E4E7EC] hover:bg-gray-50 cursor-pointer",
};

// const sizeStyles = {
//   xs: "h-[28px] xl:h-[32px] px-2 xl:px-4 text-[10px] xl:text-xs",
//   sm: "h-[36px] px-4 text-sm",
//   md: "h-[38px] px-5 text-sm",
//   lg: "h-[44px] px-6 text-base",
//   xl: "h-[48px] px-8 text-base",
// };

const sizeStyles = {
  xs: "h-8 px-2 text-xs",
  sm: "h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm",
  md: "h-9 lg:h-[36px] px-4 lg:px-2 text-xs xl:text-sm",
  lg: "h-10 lg:h-11 px-5 lg:px-6 text-xs xl:text-sm lg:text-base",
  xl: "h-11 xl:h-12 px-6 xl:px-8 text-base",
};

const CommonButton = ({
  children,
  onClick,
  icon,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  iconOnly = false,
}: CommonButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        rounded-sm
        flex md:flex-nowrap md:text-nowrap items-center justify-center gap-2
        font-medium
        transition-all duration-200
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
        ${iconOnly ? "w-[46px] px-0!" : ""}
      `}
    >
      {icon && icon}
      {children}
    </button>
  );
};

export default CommonButton;
