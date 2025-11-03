'use client';
import { Mail } from 'lucide-react';
import { siGithub, siX, siInstagram } from 'simple-icons';

const createIcon = (icon: { svg: string }) => {
  return {
    __html: icon.svg.replace('<svg', '<svg class="social-icon"'),
  };
};

export function Footer() {
  return (
    <footer>
      <div className="footer-container">
        <address className="contact">
          <h3 className="text-2xl">Contato</h3>

          <a
            href="mailto:profissional.braun@outlook.com"
            className="contact-button"
          >
            <Mail size={18} /> Email
          </a>

          <div className="social-icons">
            <a href="https://github.com/polarxpression">
              <i dangerouslySetInnerHTML={createIcon(siGithub)} />
            </a>
            <a href="https://twitter.com/rafaaa2105">
              <i dangerouslySetInnerHTML={createIcon(siX)} />
            </a>
            <a href="https://instagram.com/rafaaa2105/">
              <i dangerouslySetInnerHTML={createIcon(siInstagram)} />
            </a>
          </div>
        </address>
      </div>

      <div className="copyright">
        &copy; {new Date().getFullYear()} Polar
        <br />
        Todos os direitos reservados.
      </div>
    </footer>
  );
}
