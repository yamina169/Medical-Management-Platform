"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  HomeIcon,
  ClipboardIcon,
  ArrowLeftOnRectangleIcon,
  UserIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

const menus = {
  SUPERADMIN: [
    { name: "Dashboard", path: "/dashboard", icon: HomeIcon },
    {
      name: "Clinics",
      path: "/dashboard/superadmin/clinics",
      icon: ClipboardIcon,
    },
    {
      name: "Subscriptions",
      path: "/dashboard/superadmin/subscriptions",
      icon: CreditCardIcon,
    },
    { name: "Profile", path: "/dashboard/profil", icon: UserIcon },
  ],
};

export default function Sidebar({ userRole }) {
  const menuItems = menus[userRole] || [];
  const pathname = usePathname();

  return (
    <aside
      className="w-64 min-w-[16rem] bg-white shadow-md flex flex-col justify-between p-4 font-main
      border-r border-gray-200"
      style={{ minHeight: "calc(100vh - 56px)" }}
    >
      {/* Menu */}
      <ul className="flex-1 flex flex-col gap-1 mt-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.path);

          return (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-textPrimary hover:bg-blue-50 hover:text-blue transition-colors"
                  }
                `}
              >
                <Icon
                  className={`h-5 w-5 transition-all
                    ${isActive ? "text-white" : "text-blue"}
                  `}
                />
                <span className="font-medium">{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Logout moderne */}
      <div className="mt-6">
        <button
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl 
            text-textSecondary hover:bg-blue-50 hover:text-blue transition-all duration-200
            font-medium justify-center shadow-sm"
          onClick={() => alert("Logout clicked")}
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 text-blue" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
