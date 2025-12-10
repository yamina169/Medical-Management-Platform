import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  HomeIcon,
  ClipboardIcon,
  ArrowLeftOnRectangleIcon,
  UserIcon,
  BeakerIcon,
  BuildingLibraryIcon,
  UserGroupIcon,
  CalendarDaysIcon, // pour Appointments
} from "@heroicons/react/24/outline";

const menus = {
  SUPERADMIN: [
    { name: "Dashboard", path: "/dashboard", icon: HomeIcon },
    {
      name: "Clinics",
      path: "/dashboard/superadmin-dashboard/clinics",
      icon: ClipboardIcon,
    },
    {
      name: "Subscriptions",
      path: "/dashboard/superadmin-dashboard/subscriptions",
      icon: BeakerIcon,
    },
    { name: "Profile", path: "/dashboard/profil", icon: UserIcon },
  ],

  ADMIN_CLINIC: [
    { name: "Dashboard", path: "/dashboard", icon: HomeIcon },
    {
      name: "Patients",
      path: "/dashboard/admin-clinc-dashboard/patients",
      icon: UserIcon,
    },
    {
      name: "Receptionists",
      path: "/dashboard/admin-clinc-dashboard/receptionists",
      icon: UserGroupIcon,
    },
    {
      name: "Doctors",
      path: "/dashboard/admin-clinc-dashboard/doctors",
      icon: BeakerIcon,
    },
    {
      name: "Clinic Settings",
      path: "/dashboard/admin-clinc-dashboard/clinic",
      icon: BuildingLibraryIcon,
    },
    { name: "Profile", path: "/dashboard/profil", icon: UserIcon },
  ],

  DOCTOR: [
    { name: "Dashboard", path: "/dashboard", icon: HomeIcon },
    {
      name: "Patients",
      path: "/dashboard/doctor-dashboard/patients",
      icon: UserIcon,
    },
    {
      name: "Appointments",
      path: "/dashboard/doctor-dashboard/appointments",
      icon: CalendarDaysIcon,
    },
    { name: "Profile", path: "/dashboard/profil", icon: UserIcon },
  ],

  RECEPTIONIST: [
    { name: "Dashboard", path: "/dashboard", icon: HomeIcon },
    {
      name: "Patients",
      path: "/dashboard/receptionist-dashboard/patients",
      icon: UserIcon,
    },
    {
      name: "Appointments",
      path: "/dashboard/receptionist-dashboard/appointments",
      icon: CalendarDaysIcon,
    },
    { name: "Profile", path: "/dashboard/profil", icon: UserIcon },
  ],
};

export default function Sidebar({ userRole }) {
  const menuItems = menus[userRole] || [];
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const isActive = (itemPath) => {
    if (itemPath === "/dashboard" || itemPath === "/dashboard/profil") {
      return pathname === itemPath;
    }
    return pathname.startsWith(itemPath);
  };

  return (
    <aside className="w-64 pt-10 min-w-[16rem] bg-white shadow-md flex flex-col justify-between p-4 font-main border-r border-gray-200 overflow-y-auto fixed top-14 left-0 bottom-0 z-40">
      <ul className="flex-1 flex flex-col gap-1 mt-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "text-textPrimary hover:bg-blue-50 hover:text-blue transition-colors"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-all ${
                    active ? "text-white" : "text-blue"
                  }`}
                />
                <span className="font-medium">{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-6">
        <button
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-textSecondary hover:bg-blue-50 hover:text-blue transition-all duration-200 font-medium justify-center shadow-sm"
          onClick={handleLogout}
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 text-blue" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
