import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/Layout";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import ProtectedRoute from "../components/ProtectedRoute";
import Editor from "@/pages/Editor";
import LayoutEditor from "@/components/LayoutEditor";
import EditorPage from "@/pages/Page";
import ViewPage from "@/pages/ViewPage";
import Pages from "@/pages/Pages";
import LayoutPage from "@/components/LayoutPage";
import ViewTemplate from "@/pages/ViewTemplate";
import AudioTemplates from "@/pages/AudioTemplates";
import LookupPage from "@/pages/LookupPage";
import TemplateLookupPage from "@/pages/TemplateLookupPage";
import CreateFreeCards from "@/pages/tao-thiep-mien-phi";

// Domain detection utilities
const isDomainLookup = () => {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  // return hostname.includes('localhost');
  // Check if it's a subdomain of mehappy.info (but not the main domain or template subdomain)
  return (
    hostname.includes(".mehappy.info") &&
    hostname !== "mehappy.info" &&
    hostname !== "www.mehappy.info" &&
    hostname !== "template.mehappy.info"
  );
};

const isTemplateDomainLookup = () => {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  // Check if it's the template subdomain
  return hostname === "template.mehappy.info";
};

const renderLookupPage = () => {
  if (isDomainLookup()) {
    return <LookupPage />;
  } else if (isTemplateDomainLookup()) {
    return <TemplateLookupPage />;
  } else {
    return <Home />;
  }
};
const router = createBrowserRouter([
  // Public route for domain-based lookup (no authentication required)
  {
    path: "",
    element:
      isDomainLookup() || isTemplateDomainLookup() ? (
        <LayoutPage />
      ) : (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
    children: [
      {
        index: true,
        element:
          isDomainLookup() || isTemplateDomainLookup() ? (
            renderLookupPage()
          ) : (
            <Home />
          ),
      },
      // Handle template paths like /6, /123, etc. for template.localhost
      ...(isTemplateDomainLookup()
        ? [
            {
              path: ":templateId",
              element: <TemplateLookupPage />,
            },
          ]
        : []),
      {
        path: "pages",
        element: <Pages />,
      },
    ],
  },
  {
    path: "audio-templates",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AudioTemplates />,
      },
    ],
  },
  {
    path: "/editor/:id",
    element: (
      <ProtectedRoute>
        <LayoutEditor />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Editor />,
      },
    ],
  },
  {
    path: "/page/editor/:id",
    element: (
      <ProtectedRoute>
        <LayoutEditor />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <EditorPage />,
      },
    ],
  },
  {
    path: "/page/view/:id",
    element: <LayoutPage />,
    children: [
      {
        index: true,
        element: <ViewPage />,
      },
    ],
  },
  {
    path: "/template/view/:id",
    element: <LayoutPage />,
    children: [
      {
        index: true,
        element: <ViewTemplate />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/lookup",
    element: <LayoutPage />,
    children: [
      {
        index: true,
        element: <LookupPage />,
      },
    ],
  },
  // Template lookup route for development/testing
  {
    path: "/template-lookup/:templateId",
    element: <LayoutPage />,
    children: [
      {
        index: true,
        element: <TemplateLookupPage />,
      },
    ],
  },
  {
    path: "/tao-thiep-mien-phi",
    element: <CreateFreeCards />,
  },
]);

export default router;
